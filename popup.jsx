import React, { useState } from 'react';

import './popup.styl';
import Search from './search.coffee';


/**
 * @desc 获取当前激活的窗口激活的Tab的ID
 * @return Promise(str) 对应的Tab ID
 *
*/
function getCurrentTabId() {
    return new Promise(
        (resolve, reject) => {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs[0].id);
            });
        }
    );
}


/**
 * @desc 发送信息到当前窗口的content对象
 * @return Promise(any) content的回调
*/
function sendMessage(message) {
    return new Promise(
        (resolve, reject) => {
            getCurrentTabId().then(
                id => chrome.tabs.sendMessage(
                    id, message, resolve
                ));
        }
    );
}


/**
 * @desc 打印日志
 * @return Promise(any) content回调
*/
function log(message) {
    return new Promise(
        (resolve, reject) => {
            sendMessage({ to: "console", message: message }).then(resolve);
        }
    );
}


/**
 * @desc 获取当前网站的location对象
 * @return Promise(Object) 当前对象的location对象
*/
function getLocation() {
    return new Promise(
        (resolve, reject) => {
            sendMessage({ to: "get_location" }).then(resolve);
        }
    );
}


/**
 * @desc 设置当前网站的location对象
 * @return Promise(any) content回调
*/
function setLocation(loc) {
    return new Promise(
        (resolve, reject) => {
            sendMessage({ to: "set_location", "location": loc }).then(
                resolve);
        }
    );
}


export default function Popup(props) {
    let [loc, setLoc] = useState(null); // location 对象
    let [search_instance, setSearchInstance] = useState(null); // search_instance
    let [search, setSearch] = useState(null); // search 对象
    let [host, setHost] = useState(null); // host 对象
    let [path, setPath] = useState(null); // path 对象

    // Search 中的field计数
    let [field_count, setFieldCount] = useState(0);

    // setup search instance 
    if (search === null) {
        getLocation().then(loc => {
            let search_ins = new Search(loc.search);
            setSearchInstance(search_ins);
            setSearch(search_ins.get_search_list());
            setHost(loc.host);
            setPath(loc.pathname);
            setLoc(loc);
            setFieldCount(search_ins.get_field_count());
        });
    }

    // 重新加载location
    let reload_location = () => {
        log("Reloading Location");
        search_instance.search_list = search;

        let new_loc = {};
        new_loc.search = search_instance.get_search();
        new_loc.host = host;
        new_loc.pathname = path;
        setLocation(new_loc).then(() => log("Set Location End"));
    };

    // 复制search的字符串
    let copy_params = () => {
        log("Copy Params");
        navigator.clipboard.writeText(
            search_instance.get_search()
        ).then(() => log("Copied!"));
    }

    // 返回渲染的字符
    return (
        <div className="app">
            <div intent="header">
                <div>
                    <span intent="title">
                        Location Url Contoller
                    </span>
                    <span intent="t-item" data-info={field_count}>
                        Field: {field_count}
                    </span>
                </div>
                <div intent="control">
                    <div
                        tobe="button"
                        intent="reload-btn"
                        onClick={copy_params}>
                        Copy
                    </div>
                    <div
                        tobe="button"
                        intent="reload-btn"
                        onClick={reload_location}>
                        Reload
                    </div>
                </div>
            </div>

            <div intent="content">
                {/** 结构需要优化 **/}
                <div intent="input-group">
                    <div intent="group-header">
                        <div intent="group-title">
                            <span>Host</span>
                        </div>
                    </div>

                    <div intent="group-content">
                        <div intent="inputs-box">
                            <div intent="input-row">
                                <div intent="input-key">Host</div>
                                <div intent="input-value">
                                    <input type="text" defaultValue={host} onInput={
                                        (e) => { setHost(e.target.value); }}></input>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div intent="input-group">
                <div intent="group-title">
                    <span>Path</span>
                </div>
                <div intent="group-content">
                    <div intent="inputs-box">
                        <div intent="input-row">
                            <div intent="input-key">Path</div>
                            <div intent="input-value">
                                <input type="text" defaultValue={path} onInput={
                                    (e) => { setPath(e.target.value) }}></input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div intent="input-group">
                <div intent="group-title">
                    Parameters
                    </div>
                <div intent="group-content">
                    {
                        search === null || search?.length <= 0 ?
                            <div intent="no-field"><span>No Field In Location URL</span></div> :
                            search.map(
                                (search_item, idx) => {
                                    let search_value = decodeURIComponent(search_item[1]);
                                    return (
                                        <div intent="inputs-box">
                                            <div intent="input-row">
                                                <div intent="input-key">
                                                    <span>{search_item[0]}</span>
                                                </div>
                                                <div intent="input-value">
                                                    <input
                                                        type="text"
                                                        defaultValue={search_value}
                                                        onInput={(e) => {
                                                            let value = e.target.value;
                                                            let search_ = [...search];
                                                            search_[idx][1] = encodeURIComponent(value);
                                                            setSearch(search_);
                                                        }}
                                                    ></input>
                                                </div>
                                                <div intent="input-control">
                                                    <span onClick={() => {
                                                        search.splice(idx, 1);
                                                        setSearch(search);
                                                        setFieldCount(search.length);
                                                    }}>删除</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )
                    }
                </div>
            </div>
        </div>
    );
}
