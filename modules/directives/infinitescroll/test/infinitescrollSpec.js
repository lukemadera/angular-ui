describe('uiLookup', function () {
	var elm, scope, $compile;
	
  beforeEach(module('ui'));
	
	/**
	@param params
		@param searchText {String}
		@param noLoadMore {Boolean} true if want to set load-more to 0
	*/
	var createElm =function(params) {
		//NOTE: the leading / wrapping div is NECESSARY otherwise the html is blank.. not sure why.. i.e. if just start with <div ui-lookup... as the first div it will NOT work..
		var html ="<div>";
			if(params.noLoadMore) {
				html+="<div ui-lookup items-raw='usersRaw' items-filtered='users' filter-fields='filterFields' load-more='0' search-text='searchText' watch-item-keys='watchItemKeys'>";
			}
			else {
				html+="<div ui-lookup items-raw='usersRaw' items-filtered='users' filter-fields='filterFields' load-more='loadMore' search-text='searchText' watch-item-keys='watchItemKeys'>";
			}
				html+="<div class='friends-user' ng-repeat='user in users'>"+
					"{{user.name}}"+
				"</div>"+
			"</div>"+
		"</div>";
		elm =angular.element(html);
		
		//scope =$rootScope;
		
		//scope.searchText ='bryan';
		scope.searchText ='';
		if(params.searchText) {
			scope.searchText =params.searchText;
		}
		scope.watchItemKeys =['main'];
		scope.users =[];
		scope.filterFields =['name'];
		scope.usersRaw ={
			'main':{
				'items':[
					{'_id':'d1', 'name':'john smith'},
					{'_id':'d2', 'name':'joe bob'},
					{'_id':'d3', 'name':'joe james'},
					{'_id':'d4', 'name':'ron artest'},
					{'_id':'d5', 'name':'kobe bryant'},
					{'_id':'d6', 'name':'steve balls'}
				]
			},
			'extra':{
				'items':[
				]
			}
		};
		
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
			{'_id':'l8', 'name':'pau gasol'}
		];
		
		//@param params
		//	cursor =int of where to load from
		//	loadMorePageSize =int of how many to return
		scope.loadMore =function(params, callback) {
			var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
			callback(results, {});
		};
		
		
		$compile(elm)(scope);
		scope.$digest();
	};
	
  beforeEach(inject(function(_$rootScope_, _$compile_) {
		$compile = _$compile_;
    scope = _$rootScope_.$new();
  }));
	
	afterEach(function() {
		angular.module('ui.config').value('ui.config', {}); // cleanup
	});
	
	it('should allow no loadMore scope attr (should be optional)', function() {
		createElm({'noLoadMore':true});
		var users =elm.find('div.friends-user');
		expect(users.length).toBe(6);
	});
	
	it('should create the correct number of users pending what the search text is', function() {
		var users;
		createElm({});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(10);
		
		createElm({'searchText':'bryan'});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(1);
		
		createElm({'searchText':'w'});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(2);
		
		createElm({'searchText':'a'});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(8);
		
		createElm({'searchText':'tt'});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(2);
		
		createElm({'searchText':'b'});
		users =elm.find('div.friends-user');
		//expect(scope.users.length).toBe(5);		//seems to work also
		expect(users.length).toBe(5);
		
		createElm({'searchText':'bs'});
		users =elm.find('div.friends-user');
		expect(users.length).toBe(0);
		
		/*
		//this doesn't work.. changing searchText dynamically doesn't update.. have to recreate entire element for first load to run..
		scope.searchText ='';
		//scope.users =[];
		//scope.$digest();
		//scope.$apply();
		var users =elm.find('div.friends-user');
		expect(users.length).toBe(10);
		*/
	});
	
});