if (typeof Background !== 'function') {
	Background = function (chrome, $, window) {
		this.browser = chrome;
		this.$ = $;
		this.window = window;
		this.init();
	};
	Background.prototype = {
		constructor: Background,
		init: function () {
			var self = this;
			this.initMessageListener();
		},
		initMessageListener: function () {
			var self = this;
			this.browser.runtime.onMessage.addListener(function (message, sender, response) {
				if (!self[message.method]) {
					return;
				}
				var tab = sender;
				message.args = message.args || [];
				message.args.push(tab);
				message.args.push(response);
				self[message.method].apply(self, message.args || []);
				return true;
			});
		},
		sendMessageToTab: function (method, args, cb, tabId) {
			args = (args === null || typeof args === "undefined") ? [] : args;
			args = Array.isArray(args) ? args : [args];
			cb = typeof cb === "undefined" ? null : cb;
			if (typeof tabId === "undefined" || typeof method === "undefined") {
				throw new Error(
					"Missing required parameter " +
					(typeof tabId === "undefined" ? "'tabId'" : "'method'")
				);
			}
			this.browser.tabs.sendMessage(tabId, {
				method: method,
				args: args
			}, cb);
		},
		getSiteInfo:function(args,tab,cb) {
			var self = this;
			var apikey = '39c38cb3c12ed82be1229aa30ca0a6aa9d05d749976ba03ee62f44550beec285';
      self.$.ajax({
        url: 'https://www.virustotal.com/vtapi/v2/url/report?apikey='+apikey+'&resource='+args.site+'&allinfo=true',
        type: 'GET',
        dataType: 'json',
        contentType: 'application/json',
        success: function (data, status) {
          var res = {};
          res.status = status;
          res.data = data;
          cb(res);
        },
        error: function (xhr, ajaxOptions, thrownError) {
          var res = {};
          res.status = xhr.status;
          cb(res);
        } //set tokenString before send
      })
		},
		successNotify:function(args,tab,cb) {
			var self = this;
      var cakeNotification = "cake-notification";
      self.browser.notifications.create(cakeNotification, {
        "type": "basic",
        "iconUrl": self.browser.extension.getURL("resources/images/scan.gif"),
        "title": "Site Secure",
        "message": "Site:"+args.site+"\nNo Errors found!\n"
      });
		},
		errorNotify:function(args,tab,cb) {
			var self = this;
			var cakeNotification = "cake-notification";
			var errorMsg = '';
			args.site.forEach((element,index) => {
					errorMsg = errorMsg+'\n';
					errorMsg  =errorMsg+' '+(index+1)+' ';
					errorMsg = errorMsg+element.result;
			});
      self.browser.notifications.create(cakeNotification, {
        "type": "basic",
        "iconUrl": self.browser.extension.getURL("resources/images/error.png"),
        "title": "Site Infected",
				"message": "Site:"+args.url+"\nErrors found \n"+errorMsg
      });
		},
		/*sample database*/

// JSONQury:

// 0:{id: "4", name: "teste", website: null, parentID: "3", depth: "2", …}
// 1:{id: "5", name: null, website: "https://stunbs.com", parentID: "4", depth: "3", …}
// 2:{id: "6", name: "teste2", website: null, parentID: "4", depth: "3", …}
// 3:{id: "7", name: null, website: "https://nike.com", parentID: "6", depth: "4", …}

JSONQury: [
{	id: "4", name: "teste", website: null, parentID: "3", depth: "2"},
{id: "5", name: null, website: "https://stunbs.com", parentID: "4", depth: "3"},
{id: "6", name: "teste2", website: null, parentID: "4", depth: "3"},
{id: "7", name: null, website: "https://nike.com", parentID: "6", depth: "4"}
],

updateBkmrks: function ()//https://www.pluralsight.com/guides/javascript-callbacks-variable-scope-problem
{  
	var self = this;                           
		var i;
		for (i = 0; i < self.JSONQury.length; i++)
		{ 
				var pId = self.JSONQury[i].parentID;
				if(!pId.localeCompare("3"))
				{    
						if(self.JSONQury[i].website)
						{
								chrome.bookmarks.create({'parentId': '1','title': '','url': self.JSONQury[i].website});
						}
						else
						{
								chrome.bookmarks.create({'parentId': '1','title': self.JSONQury[i].name,'url': ''});
						}
				}
				else
				{
								var j;
								for (j = 0; j < self.JSONQury.length; j++)
								{
										if(self.JSONQury[j].id==self.JSONQury[i].parentID) pName = self.JSONQury[j].name;
								}
								self.initiateUpdate(pName,i)
							
		}

		}
},
initiateUpdate:function(parName ,k) {
	var self = this;
	self.k = k;
	self.searchPIDBookmarks(parName,k);
},
traverseInsertBookmarks: function (pid,name, website) {
	var self = this;
	self.browser.bookmarks.getTree(function(bookmarkTreeNodes) {
		self.createBookmark(bookmarkTreeNodes, pid,name, website);
  })
},
createBookmark:function(bookmarkTreeNodes, pid, name, website) {
	var self = this;
	for(var i=0;i<bookmarkTreeNodes.length;i++) {
		if(bookmarkTreeNodes[i].id == pid)
		{
			self.browser.bookmarks.create({'parentId': pid,'title': name,'url': website});
			if(name !== null && website === null) {
				self.searchPIDBookmarks(name,self.k);
			}
			break;
		}
		if(bookmarkTreeNodes[i].children) {
				self.createBookmark(bookmarkTreeNodes[i].children,pid,name,website);
		}
	}
},                    
searchPIDBookmarks:function(name,k) {
	var self = this	
	self.browser.bookmarks.getTree(function(bookmarkTreeNodes) {
		self.setParId(bookmarkTreeNodes, name,k);
	})
},
setParId:function(bookmarkTreeNodes, name,k) {
	var self = this;
	for(var i=0;i<bookmarkTreeNodes.length;i++) {
		if(name.localeCompare(bookmarkTreeNodes[i].title) == 0)
		{
				self.traverseInsertBookmarks(bookmarkTreeNodes[i].id,self.JSONQury[k].name, self.JSONQury[k].website);
		} else {
			if(bookmarkTreeNodes[i].children) {
					self.setParId(bookmarkTreeNodes[i].children,name,k);
			} 
		}

}
}
    
	}
}
var background = new Background(chrome, jQuery, window);
