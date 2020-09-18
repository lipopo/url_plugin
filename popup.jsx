import React, { useState } from 'react';

import './popup.styl';
import Search from './search.coffee';


function getCurrentTabId()
{
    return new Promise(
	(resolve, reject) => {
	    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		resolve(tabs[0].id);
	    });
	}
    );
}


function sendMessage(message)
{
    return new Promise(
	(resolve, reject) => {
	    getCurrentTabId().then(
		id => chrome.tabs.sendMessage(
		    id, message, resolve
	    ));
	}
    );
}


function log(message)
{
    return new Promise(
	(resolve, reject) => {
	    sendMessage({to: "console", message: message}).then(resolve);
	}
    );
}


function getLocation()
{
    return new Promise(
	(resolve, reject) => {
	    sendMessage({to: "get_location"}).then(resolve);
	}
    );
}


function setLocation(loc)
{
    return new Promise(
	(resolve, reject) => {
	    sendMessage({to: "set_location", "location": loc}).then(
	        resolve);
	}
    );
}


export default function Popup(props)
{
    let [search, setSearch] = useState(null);
    let [field_count, setFieldCount] = useState(0);
    let [loc, setLoc] = useState(null);
    let [search_instance, setSearchInstance] = useState(null);

    if(search === null)
    {
        getLocation().then(loc => {
      	    let search_ins = new Search(loc.search);
	    setSearchInstance(search_ins);
	    log(search_ins);
	    setSearch(search_ins.get_search_list());
	    setLoc(loc);
	    setFieldCount(search_ins.get_field_count());
        });
    }

    let reload_location = () => {
	log("Reloading Location");
	search_instance.search_list = search;
	loc.search = search_instance.get_search();
	setLocation(loc).then(() => log("Set Location End"));
    }; 

    let copy_params = () => {
	log("Copy Params");
	navigator.clipboard.writeText(
	    search_instance.get_search()
	).then(() => log("Copied!"));
    }

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
	            <div tobe="button" intent="reload-btn" onClick={copy_params}>
	                Copy Params
	            </div>
	            <div tobe="button" intent="reload-btn" onClick={reload_location}>
	                Reload Location
	            </div>
	        </div>
	    </div>
	    <div intent="content">
	    {
		search === null || search?.length <= 0 ? <div intent="no-field">
		  <span>No Field In Location URL</span>
		</div> :
		search.map(
		    (search_item, idx) => {
			let search_value = decodeURIComponent(search_item[1]);
			return (
			    <div intent="inputs-box">
			        <div intent="input-row">
			            <div intent="input-key">
			                <span>{ search_item[0] }</span>
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
    );
}
