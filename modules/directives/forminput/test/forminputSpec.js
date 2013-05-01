/* @todo */
describe('uiForminput', function () {
	var elm, scope, $compile;
	
  beforeEach(module('ui'));
	
  beforeEach(inject(function(_$rootScope_, _$compile_) {
		$compile = _$compile_;
    scope = _$rootScope_.$new();
  }));
	
	afterEach(function() {
		angular.module('ui.config').value('ui.config', {}); // cleanup
	});
	
	/*
	it('should allow no loadMore scope attr (should be optional)', function() {
		createElm({'noLoadMore':true});
		var users =elm.find('div.friends-user');
		expect(users.length).toBe(6);
	});
	*/
	
});