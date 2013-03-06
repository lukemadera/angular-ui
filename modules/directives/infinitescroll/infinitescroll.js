/**
@todo
- allow optional scope attrs?? i.e. loadMore isn't really necesssary and the logic handles this but the directive throws an error if they're not defined and unit-testing fails.. so just need to figure out syntax / compiler way to allow this..


Uses one array and start / end indices (cursor) to set a combination of DOM elements, javascript data, and backend (AJAX) data to handle paging/infinite scroll loading of content (i.e. a list of objects)
	- handles paging / loading more when scroll to bottom
	- can be used with a backend lookup call to load more results (if "loadMore" attr/scope function is passed in)
		- loadMore function is called when have less than full results among current items stored in javascript, which happens 1 way:
			1. when scroll to end of page / load more results

//TOC
//10. add scroll handle to load more
//0.5. init
//0.75. resetItems
//1. setItems
//1.5. setItemsViewCursor
//2. scrollToMiddle
//5. 
//5.5. 
//6. $scope.loadMoreDir
//6.5. changePage
//7. getMoreItems
//8. addLoadMoreItems
//9. checkForScrollBar

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	REQUIRED
	@param items {Array} of any initial items to use
	@param itemsView {Array} of placeholder for final items to display in DOM
	@param opts {Object}
		@param cursors {Object} of start and end indices that tell where items are in the scheme of the entire (full) list so can handle loading more to start and/or end. A second object with 
			@param items {Object}
				@param start {Number}
				@param end {Number}
			@param itemsView {Object}
				@param current {Number} of what item to start on - this will correspond to the current page and then the start and end will be formed as 1 pageSize forward and 1 pageSize backward
		@param scrollId {String} of id for element to watch scrolling on (instead of using window/full page scroll bar OR the ui-infinitescroll-content element built in this directive as the default scroll div)
	@param loadMore =function to call to load more results (this should update $scope.items, which will then update in the directive via $watch). OR '0' if don't have loadMore function at all

attrs
	REQUIRED
	OPTIONAL
	scrollLoad =1 to do paging via scrolling as opposed to with "load more" button to click to load more
		DEFAULT: 0
	pageScroll =1 to do paging via scrolling for entire window as opposed to a specific div (good for mobile / touch screens where only 1 scroll bar works well)
		DEFAULT: 0
	scrollBuffer =int of how much space from top or bottom to start switch the page
		DEFAULT: 50
	pageSize =int of how many results to show at a time (will load more in increments of pageSize as scroll down / click "more")
		DEFAULT: 10
	loadMorePageSize =int of how many results to load at a time - must be at least as large as pageSize (and typically should be at least 2 times as big as page size?? maybe not? just need to ensure never have to AJAX twice to display 1 page)
		DEFAULT: 20
	noStopLoadMore {Number} 1 to not set noMoreLoadMoreItems prev & next to true if don't have enough results returned from load more
		DEFAULT: 0


EXAMPLE usage:
partial / html:
	<div ui-infinitescroll items='usersList' items-view='users' load-more='loadMore'>
		<!-- custom display code to ng-repeat and display the results (items) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	//$scope.opts.watchItemKeys =['main'];
	$scope.users =[
		{'_id':'d1', 'name':'john smith'},
		{'_id':'d2', 'name':'joe bob'},
		{'_id':'d3', 'name':'joe james'},
		{'_id':'d4', 'name':'ron artest'},
		{'_id':'d5', 'name':'kobe bryant'},
		{'_id':'d6', 'name':'steve balls'},
	];
	
	//handle load more (callbacks)
	var itemsMore =
	[
		{'_id':'l1', 'name':'sean battier'},
		{'_id':'l2', 'name':'lebron james'},
		{'_id':'l3', 'name':'dwayne wade'},
		{'_id':'l4', 'name':'rajon rondo'},
		{'_id':'l5', 'name':'kevin garnett'},
		{'_id':'l6', 'name':'ray allen'},
		{'_id':'l7', 'name':'dwight howard'},
		{'_id':'l8', 'name':'pau gasol'},
	];
	
	//@param params
	//	cursor =int of where to load from
	//	loadMorePageSize =int of how many to return
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiInfinitescroll', ['ui.config', '$compile', '$timeout', function (uiConfig, $compile, $timeout) {
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			items: '=',
			itemsView: '=',
			opts:'=',
			//watchItemKeys:'=',		//note: this is not required & will throw an error if not set but it still works? @todo fix this so it's not required & doesn't throw error?
			loadMore:'&',
			//cursors: '='
		},

		compile: function(element, attrs) {
			var defaults ={'pageSize':10, 'scrollLoad':'0', 'loadMorePageSize':20, 'pageScroll':0, 'scrollBuffer':75, 'scrollBufferPercent':33, 'noStopLoadMore':0};
			for(var xx in defaults) {
				if(attrs[xx] ==undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			attrs.pageSize =parseInt(attrs.pageSize, 10);
			attrs.loadMorePageSize =parseInt(attrs.loadMorePageSize, 10);
			attrs.scrollLoad =parseInt(attrs.scrollLoad, 10);
			attrs.scrollBuffer =parseInt(attrs.scrollBuffer, 10);
			attrs.pageScroll =parseInt(attrs.pageScroll, 10);
			attrs.noStopLoadMore =parseInt(attrs.noStopLoadMore, 10);
			//ensure loadMorePageSize is at least as large as pageSize
			if(attrs.loadMorePageSize <attrs.pageSize) {
				attrs.loadMorePageSize =attrs.pageSize;
			}
			if(attrs.id ==undefined) {
				attrs.id ="uiInfinitescroll"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'input':id1+"Input",
				'contentBottom':id1+"ContentBottom",
				'inputBelow':id1+"InputBelow",
				'scrollContent':id1+"ScrollContent"
			};
			
			var html="<div class='ui-infinitescroll'>"+
				"<div class='ui-infinitescroll-top'>"+
					//"<div>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} items.length: {{items.length}}</div>"+		//TESTING
					//"<div>hasScrollbar: {{hasScrollbar}} | scrollLoad: {{scrollLoad}}</div>"+		//TESTING
					//"<div ng-show='itemsFiltered.length <1'>No matches</div>"+
					"<div ng-hide='(noMoreLoadMoreItems.prev) || opts.cursors.itemsView.start <=0 || (scrollLoad && hasScrollbar)' class='ui-infinitescroll-more' ng-click='loadMoreDir({\"prev\":true})'>Load More</div>"+
					//"<div ng-show='noMoreLoadMoreItemsPrev && queuedItemsPrev.length <1' class='ui-lookup-no-more'>No More Results!</div>"+
				"</div>"+
				"<div id='"+attrs.ids.scrollContent+"' class='ui-infinitescroll-content' ng-transclude></div>"+
				"<div id='"+attrs.ids.contentBottom+"'>"+
					"<div ng-hide='(noMoreLoadMoreItems.next) || (scrollLoad && hasScrollbar)' class='ui-infinitescroll-more' ng-click='loadMoreDir({})'>Load More</div>"+
					//"<div>page: {{page}} cursors: items.start: {{opts.cursors.items.start}} items.end: {{opts.cursors.items.end}} itemsView.start: {{opts.cursors.itemsView.start}} itemsView.end: {{opts.cursors.itemsView.end}} itemsView.current: {{opts.cursors.itemsView.current}} items.length: {{items.length}}</div>"+		//TESTING
					//"<div>scrollInfo: %fromTop: {{scrollInfo.percentTop}} %fromBot: {{scrollInfo.percentBottom}} pos: {{scrollInfo.scrollPos}} diff: {{scrollInfo.diff}} height: {{scrollInfo.scrollHeight}} viewportHeight: {{scrollInfo.viewportHeight}}</div>"+		//TESTING
					"<div ng-show='noMoreLoadMoreItems.next' class='ui-infinitescroll-no-more'>No More Results!</div>"+
				"</div>"+
			"</div>";
				
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaultsOpts ={
				//'watchItemKeys':['main'],
				'cursors':{
					'items':{
						'start':0,
						'end':0
					},
					'itemsView':{
						'current':0
					}
				},
				'scrollId':false
			};
			if($scope.opts ==undefined) {
				$scope.opts ={};
			}
			for(var xx in defaultsOpts) {
				if($scope.opts[xx] ==undefined) {
					$scope.opts[xx] =defaultsOpts[xx];
				}
			}
			
			var scrollId =$attrs.ids.scrollContent;		//default
			if($scope.opts.scrollId) {
				scrollId =$scope.opts.scrollId;
			}
			
			$scope.trigs ={'loading':false};
			//$scope.items =[];
			
			//boolean that will be set to true if (backend) has no more items (i.e. we're at the end of the list and can't load any more)
			$scope.noMoreLoadMoreItems ={
				'prev':false,
				'next':false
			};
			
			$scope.scrollLoad =$attrs.scrollLoad;
			
			//if scroll load style, ensure attrs.ids.scrollContent has scrollable styles (height & overflow)
			if($scope.scrollLoad) {
				if(!$attrs.pageScroll) {
					var ele1 =document.getElementById(scrollId);
					eleAng =angular.element(ele1);
					var height1 =eleAng.css('height');
					var overflow1 =eleAng.css('overflow');
					if(!height1 || !overflow1) {
						eleAng.addClass('ui-lookup-content-scroll');
					}
				}
				
				$scope.hasScrollbar =false;		//init
			}
			
			var timeoutInfo ={
				'scrolling':{
					'trig':false,
					'delay':750
				}
			};
			
			//10.
			//add scroll handle to load more
			if($attrs.scrollLoad) {
				if($attrs.pageScroll) {
					window.onscroll =function() {
						$timeout.cancel(timeoutInfo.scrolling.trig);
						timeoutInfo.scrolling.trig =$timeout(function() {
							//console.log('uiLookup timeout scrolling loading');
							var buffer =$attrs.scrollBuffer;
							var scrollPos =$(window).scrollTop();
							var scrollHeight =$(document).height();
							var viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							var percentTop =scrollPos /scrollHeight *100;
							var percentBottom =(scrollPos +viewportHeight) /scrollHeight *100;
							$scope.scrollInfo ={
								'scrollPos':scrollPos,
								'scrollHeight':scrollHeight,
								'viewportHeight':viewportHeight,
								'diff':(scrollHeight-viewportHeight-buffer),
								'percentTop':percentTop,
								'percentBottom':percentBottom
							};
							//if(scrollPos >=(scrollHeight-viewportHeight-buffer) || (percentBottom > (100-$attrs.scrollBufferPercent)) ) {
							if(scrollPos >5 && scrollPos >=(scrollHeight-viewportHeight-buffer)) {		//don't load more if 0 scrollPos (this specificlly fixes an initial double load issue)
								$scope.loadMoreDir({'noDelay':true, 'next':true});
							}
							//prev version
							//if(scrollPos <=buffer || (percentTop <$attrs.scrollBufferPercent) ) {
							if(scrollPos <=buffer ) {
								$scope.loadMoreDir({'noDelay':true, 'prev':true});
							}
						}, timeoutInfo.scrolling.delay);
					};
				}
				else {
					document.getElementById(scrollId).onscroll =function() {
						$timeout.cancel(timeoutInfo.scrolling.trig);
						timeoutInfo.scrolling.trig =$timeout(function() {
							//console.log('uiLookup timeout scrolling loading');
							var buffer =$attrs.scrollBuffer;
							var ele =document.getElementById(scrollId);
							var scrollPos =ele.scrollTop;
							var scrollHeight =ele.scrollHeight;
							//var viewportHeight =$(ele).height();
							var viewportHeight =ele.clientHeight;
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							if(scrollPos >=(scrollHeight-viewportHeight-buffer)) {
								$scope.loadMoreDir({'noDelay':true, 'next':true});
							}
							//prev version
							if(scrollPos <=buffer) {
								$scope.loadMoreDir({'noDelay':true, 'prev':true});
							}
						}, timeoutInfo.scrolling.delay);
					};
				}
			}
			
			//0.5.
			function init(params) {
				//$scope.page =1;		//will store what page (broken up by pageSize attr) we're on
				$scope.page =Math.floor($scope.opts.cursors.itemsView.current / $attrs.pageSize);
				setItemsViewCursor({});
				
				//formItems({});
				if($scope.items.length <$attrs.pageSize*2) {		//load more externally if don't have enough
					$scope.loadMoreDir({});
				}
			}
			
			//0.75.
			function resetItems(params) {
				/*
				@todo
				$scope.page =1;		//reset
				checkForScrollBar({});
				$scope.noMoreLoadMoreItems =false;
				cursors ={
					//'extra':0,
				};
				cursors[$attrs.loadMoreItemsKey] =0;
				$scope.itemsRaw[$attrs.loadMoreItemsKey].items =[];
				document.getElementById(scrollId).scrollTop =0;
				*/
				var dummy =1;
			}
			
			//1.
			/**
			Updates viewable (DOM) items (sets the range)
			@param params
			*/
			function setItems(params) {
				
				$scope.opts.cursors.itemsView.end =$scope.page*$attrs.pageSize +$attrs.pageSize;
				setItemsViewCursor({});
				$scope.itemsView =$scope.items.slice($scope.opts.cursors.itemsView.start, $scope.opts.cursors.itemsView.end);
				scrollToMiddle({});
				checkForScrollBar({});
			}
			
			//1.5.
			function setItemsViewCursor(params) {
				var end =$scope.page*$attrs.pageSize +$attrs.pageSize;
				if(end >$scope.items.length) {
					end =$scope.items.length;
				}
				$scope.opts.cursors.itemsView.end =end;
				var start =$scope.page*$attrs.pageSize -$attrs.pageSize;
				if(start <0) {
					start =0;
				}
				$scope.opts.cursors.itemsView.start =start;
			}
			
			//2.
			function scrollToMiddle(params) {
				if($attrs.pageScroll) {
					if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - @todo - could probably find a better fix - i.e. also check what the last cursor was at?)
						window.scrollTo(0, 0);
					}
					else {
						var scrollPos =$(window).scrollTop();
						var scrollHeight =$(document).height();
						var viewportHeight =$(window).height();
						var middle =Math.floor((scrollHeight/2) -viewportHeight/2);
						window.scrollTo(0, middle);
					}
					//console.log('scrollPos: '+$(window).scrollTop());
				}
				else {
					if($scope.opts.cursors.itemsView.start ==0) {		//if at top, just go to top (specifically this addresses a double initial load issue that causes the first time to show halfway down rather than at the top - @todo - could probably find a better fix - i.e. also check what the last cursor was at?)
						document.getElementById(scrollId).scrollTop =0;
					}
					else {
						var ele =document.getElementById(scrollId);
						var scrollPos =ele.scrollTop;
						var scrollHeight =ele.scrollHeight;
						//var viewportHeight =$(ele).height();
						var viewportHeight =ele.clientHeight;
						var middle =Math.floor((scrollHeight/2) -viewportHeight/2);
						document.getElementById(scrollId).scrollTop =middle;
					}
					//console.log('scrollPos: '+ele.scrollTop);
				}
			}
			
			//5.
			/*
			//doesn't work - have to watch a sub array piece
			$scope.$watch('itemsRaw', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					formItems({});
				}
			});
			*/
			if(0) {
			//@todo ?
			//for(var xx in $scope.itemsRaw) {
			for(var ii =0; ii<$scope.opts.watchItemKeys.length; ii++) {
				var xx =$scope.opts.watchItemKeys[ii];
				//$scope.$watch('itemsRaw', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw['+xx+'].items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra.items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.extra', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.'+xx, function(newVal, oldVal) {
				$scope.$watch('itemsRaw.'+xx+'.items', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						if($scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//if only on first page, reset (otherwise load more button / triggers will be set to false since there's no more in queue / from backend)
							resetItems({});
						}
						formItems({});
						/*
						if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
							$scope.loadMoreDir({});
						}
						*/
					}
				});
			}
			}
			
			/*
			//@todo ?
			//5.5. $watch not firing all the time... @todo figure out & fix this.. (also this will reform ALL instances - should pass in an instance id - which means the directive would have to pass an instance back somehow..)
			$scope.$on('uiLookupReformItems', function(evt, params) {
				formItems({});
			});
			*/
			
			//6.
			/*
			Starts the load more process - checks if need to load more (may already have more items in the existing javascript items array, in which case can just load more internally) and IF need to load more external items, sets a timeout to do so (for performance to avoid rapid firing external calls)
				This is paired with the getMoreItems function below - which handles actually getting the items AFTER the timeout
			@param params
				noDelay =boolean true to skip the timeout before loading more (i.e. if coming from scroll, in which case already have waited)
			*/
			$scope.loadMoreDir =function(params) {
				var getMoreItemsTrig =false;
				if(params.prev) {
					//if have more items left, increment page & show them
					if(($scope.opts.cursors.items.start ==0 && $scope.opts.cursors.itemsView.start !=0) || $scope.opts.cursors.items.start < ($scope.opts.cursors.itemsView.start -$attrs.pageSize)) {
						changePage({'prev':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'prev':true});
					}
				}
				else {
					//if have more items left, increment page & show them
					if($scope.opts.cursors.items.end > ($scope.opts.cursors.itemsView.end +$attrs.pageSize) || ($scope.noMoreLoadMoreItems.next && $scope.opts.cursors.items.end >$scope.opts.cursors.itemsView.end) ) {
						changePage({'next':true});
					}
					else {
						getMoreItemsTrig =true;
						//set timeout to get more from backend if function has been given for how to do so
						params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
						getMoreItems({'next':true});
					}
				}
			};
			
			//6.5.
			/**
			@param params
				prev {Boolean} true if loading previous (i.e. scrolling toward beginning)
			*/
			function changePage(params) {
				if(params.prev) {
					$scope.page--;
				}
				else {
					$scope.page++;
				}
				setItems({});
			}
			
			//7.
			/*
			Handles loading items from the queue and calling the external loadMore function to pre-fill the queue for the next page (this is the function that runs AFTER the timeout set in $scope.loadMoreDir function)
			If have items in queue, they're added to itemsRaw and then formItems is re-called to re-form filtered items & update display
			@param params
				prev
				next
			*/
			function getMoreItems(params) {
				if($scope.loadMore !=undefined && $scope.loadMore() !=undefined && typeof($scope.loadMore()) =='function') {		//this is an optional scope attr so don't assume it exists
					var ppTemp ={};
					if(params.prev) {
						ppTemp.prev =true;
						if($scope.opts.cursors.items.start >0 && !$scope.noMoreLoadMoreItems.prev) {		//only try to load more if have more left to load
							var loadPageSize =$attrs.loadMorePageSize;
							var cursor =$scope.opts.cursors.items.start -loadPageSize;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
					else {
						ppTemp.next =true;
						if(!$scope.noMoreLoadMoreItems.next) {		//only try to load more if have more left to load
							var loadPageSize =$attrs.loadMorePageSize;
							var cursor =$scope.opts.cursors.items.end;
							$scope.loadMore()({'cursor':cursor, 'loadMorePageSize':loadPageSize, 'searchText':''}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
				}
			}
			
			//8.
			/*
			This is the callback function that is called from the outer (non-directive) controller with the externally loaded items. These items are added to the queue and the cursor is updated accordingly.
				- Additionally, the noMoreLoadMoreItems trigger is set if the returned results are less than the loadMorePageSize
				- Also, it immediately will load from queue if the current page isn't full yet (if params.partialLoad & params.numToFillCurPage are set)
			@param results =array [] of items (will be appended to queue)
			@param ppCustom =params returned from callback
			@param params
				prev {Boolean}
				next {Boolean}
			*/
			function addLoadMoreItems(results, ppCustom, params) {
				if(results.length >0) {
					if(params.prev) {
						$scope.items =results.concat($scope.items);
						$scope.opts.cursors.items.start -=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
					}
					else {
						$scope.items =$scope.items.concat(results);
						$scope.opts.cursors.items.end +=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
					}
					
					changePage(params);
				}
				else {
					if( (params.prev && $scope.opts.cursors.items.start < $scope.opts.cursors.itemsView.start) || (params.next && $scope.opts.cursors.items.end > $scope.opts.cursors.itemsView.end)) {		//display last ones from javascript
						changePage(params);
					}
				}
				
				//if don't have enough results, assume backend is done so are out of items
				//if(!$attrs.noStopLoadMore) {
				if(0) {		//@todo - fix this since "no more results" is displaying early - trigger is set correctly below but html display needs another condition or something when there's still items left in javascript but no more on backend to not show "no more results" yet
					if(results.length <$attrs.loadMorePageSize || (params.loadPageSize !=undefined && results.length <params.loadPageSize)) {
						if(params.prev) {
							$scope.noMoreLoadMoreItems.prev =true;
						}
						else {
							$scope.noMoreLoadMoreItems.next =true;
						}
					}
				}
			}
			
			//9.
			function checkForScrollBar(params) {
				if($scope.scrollLoad) {
					$timeout(function() {		//need timeout to wait for items to load / display so scroll height is correct
						if($attrs.pageScroll) {
							//var scrollPos =$(window).scrollTop();
							var scrollHeight =$(document).height();
							var viewportHeight =$(window).height();
							//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
						else {
							var ele =document.getElementById(scrollId);
							//var scrollPos =ele.scrollTop;
							var scrollHeight =ele.scrollHeight;
							var viewportHeight =ele.clientHeight;
							//console.log('checkForScrollBar scrollHeight: '+scrollHeight+' viewportHeight: '+viewportHeight);
							if(scrollHeight >viewportHeight) {
								$scope.hasScrollbar =true;
							}
							else {
								$scope.hasScrollbar =false;
							}
						}
					}, 100);
				}
			}
			
			init({});		//init (called once when directive first loads)
		}
	};
}]);