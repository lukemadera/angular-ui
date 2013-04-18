describe('uiMultiselect', function () {
	var elm, scope, $compile;
	
  beforeEach(module('ui'));
  
  //@todo
	
  beforeEach(inject(function(_$rootScope_, _$compile_) {
		$compile = _$compile_;
    scope = _$rootScope_.$new();
  }));
	
	afterEach(function() {
		angular.module('ui.config').value('ui.config', {}); // cleanup
	});
	
});