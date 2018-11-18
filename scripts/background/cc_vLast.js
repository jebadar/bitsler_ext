/*sample database

JSONQury:

0:{id: "4", name: "teste", website: null, parentID: "3", depth: "2", …}
1:{id: "5", name: null, website: "https://stunbs.com", parentID: "4", depth: "3", …}
2:{id: "6", name: "teste2", website: null, parentID: "4", depth: "3", …}
3:{id: "7", name: null, website: "https://nike.com", parentID: "6", depth: "4", …}

*/
function updateBkmrks()//https://www.pluralsight.com/guides/javascript-callbacks-variable-scope-problem
{                             
                            var i;
                            for (i = 0; i < JSONQury.length; i++)
                            { 
                                var pId = JSONQury[i].parentID;
                                if(!pId.localeCompare("3"))
                                {    
                                    if(JSONQury[i].website)
                                    {
                                        chrome.bookmarks.create({'parentId': '1','title': '','url': JSONQury[i].website});
                                    }
                                    else
                                    {
                                        chrome.bookmarks.create({'parentId': '1','title': JSONQury[i].name,'url': ''});
                                    }
                                }
                                else
                                {
                                    
                                        var j;
                                        for (j = 0; j < JSONQury.length; j++)
                                        {
                                            if(JSONQury[j].id==JSONQury[i].parentID) pName = JSONQury[j].name;
                                        }
                                    initiateUpdate(pName,i)
//                                     chrome.bookmarks.getTree(function(results){   // here
//                                         var parName = pName;
//                                         var k = i;
//                                         return function(results){
                                            
//                                         };
//                                      }());
                                     
                            }
    
                            }
}
function initiateUpdate(parName ,k) {
    global_k = k;
  searchPIDBookmarks(parName,k);
}
function traverseInsertBookmarks(pid,name, website) {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    createBookmark(bookmarkTreeNodes, pid,name, website);
  })
}
function createBookmark(bookmarkTreeNodes, pid,name, website) {
    for(var i=0;i<bookmarkTreeNodes.length;i++) {
        console.log(bookmarkTreeNodes[i].id + ':'+bookmarkTreeNodes[i].title, bookmarkTreeNodes[i].url ? bookmarkTreeNodes[i].url : "[Folder]");
        if(bookmarkTreeNodes[i].id == pid)
        {
            chrome.bookmarks.create({'parentId': pid,'title': name,'url': website});                          
            if(name !== null && website === null) {
				searchPIDBookmarks(name,global_k);
			}
			break;
        }
        if(bookmarkTreeNodes[i].children) {
            createBookmark(bookmarkTreeNodes[i].children,pid,name,website);
        }
    }
  }
                           
function setParId (bookmarkTreeNodes, name, k) {
    for(var i=0;i<bookmarkTreeNodes.length;i++) {
        if(name.localeCompare(bookmarkTreeNodes[i].title) == 0)
        {
            traverseInsertBookmarks(bookmarkTreeNodes[i].id,self.JSONQury[k].name, self.JSONQury[k].website);
        } else {
        	if(bookmarkTreeNodes[i].children) {
                setParId(bookmarkTreeNodes[i].children,name,k);
        	}
        }
    }
}
function searchPIDBookmarks(name,k) {
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    	setParId(bookmarkTreeNodes, name, k);
    })
}
    