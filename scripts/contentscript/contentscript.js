if (typeof ContentScript !== 'function') {
	ContentScript = function (window, document, $, chrome, selectors) {
		this.window = window;
		this.document = document;
		this.$ = $;
		this.browser = chrome;
		this.selectors = selectors;
		this.initMessageListener();
		this.initFunctionality();
		// this.enableKeyListener();
	};
	ContentScript.prototype = {
		constructor: ContentScript,
		tabActive: true,
		switchStatus:true,
		status: 'inactive',
		initFunctionality: function () {
			var self = this;
			this.status = 'active';
      self.browser.storage.sync.get({
        buttonState: false
      }, function(items){
        if(items != undefined) {
          self.buttonState = items.buttonState;
          // if(self.buttonState) {
          	self.enableArrive();
					// }
        } else {
          self.enableArrive();
        };
      });
    },
		enableArrive:function() {
			var self = this;
      this.document.arrive(this.selectors.headSite, { existing: true, onceOnly:true }, function (e) {
        if (self.tabActive) {
          self.browser.storage.sync.get({
            buttonState: false
          }, function(items){
            if(items != undefined) {
              self.buttonState = items.buttonState;
              // if(self.buttonState) {
              	self.sendDataKey(e);
							// }
            } else {
            	self.sendDataKey(e);
						};
          });
          }
      });
		},
		enableArriveOnce:function() {
			var self = this;
      this.document.arrive(this.selectors.captchElement, { existing: true, onceOnly:true }, function (e) {
        if (self.tabActive) {
          self.sendDataKey(e);
        }
      });
		},
		sendDataKey: function(e) {
			var self = this;
      var url = self.window.location.href;
      self.sendMessageToBg('getSiteInfo',{site:url},self.siteInfoResponse.bind(self))
    },
		siteInfoResponse:function(response) {
			var self = this;
			var scanResults = response.data.scans;
			var keys = Object.keys(scanResults);
			var errors = [];
			for(let i = 0; i < keys.length; i++) {
				if(scanResults[keys[i]].detected) {
					errors.push(scanResults[keys[i]]);
				}
			}
			if(errors.length < 1) {
				self.sendMessageToBg('successNotify',{site:response.data.url},self.siteInfoResponse.bind(self))
				// self.sendMessageToBg('successNotify',{site:response.data.url},[]);	
			} else if(errors.length > 0) {
				self.sendMessageToBg('errorNotify',{site:errors, url:response.data.url},self.siteInfoResponse.bind(self))

				// self.sendMessageToBg('errorNotify',{errors},[]);		
			}
		},
		initMessageListener: function () {
			var self = this;
			this.browser.runtime.onMessage.addListener(function (message, sender, response) {
				if (!self[message.method]) {
					throw new Error('Method "' + message.method + '" does not exist');
				}
				var tab = sender;
				message.args = message.args || [];
				message.args.push(tab);
				message.args.push(response);
				self[message.method].apply(self, message.args || []);
				return true;
			});
		},
		listenUpdateUrl:function() {
			var self = this;
			self.browser.tabs.onUpdated.addListener(
				function(tabId, changeInfo, tab) {
					self.enableArrive();
				}
			);
		},
		sendMessageToBg: function (method, args, cb) {
			args = (args === null || typeof args === "undefined") ? [] : args;
			args = Array.isArray(args) ? args : [args];
			cb = typeof cb === "undefined" ? null : cb;
			if (typeof method === "undefined" || typeof method !== "string") {
				throw new Error("Missing required parameter 'method'");
			}
			this.browser.runtime.sendMessage({
				method: method,
				args: args
			},cb);
		}
	}
}
var content = new ContentScript(window, document, jQuery, chrome, selectors);