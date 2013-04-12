describe('uiSlider', function ()
{
	var elm, scope, $compile;
	
  beforeEach(module('ui'));
	
	/**
	@param params
		@param {String} id Id of the slider.
		@param {String} handle_var Name of the scope variable to bind handles to.
		@param {Object} opts Slider options object.
	*/
	/* An example options object, with all properties defined and set to default. Properties not different from the default may be omitted.
		$scope.opts = 
		{
			'num_handles': '1',
			'slider_min': '0',
			'slider_max': '100',
			'precision': '0',
			'scale_string': '[1, 1]',
			'zero_method': 'newton',
			'increment': '0',
			'user_values': '',
			'evt_mouseup': '',
			'slider_moveable': true,
			'use_array': true,
			'container_class': 'ui-slider',
			'bar_container_class': 'ui-slider-bar',
			'left_bg_class': 'ui-slider-bar-active',
			'interior_bg_class': 'ui-slider-bar-active',
			'right_bg_class': 'ui-slider-bar-inactive',
			'handle_class': 'ui-slider-bar-handle',
			'handle_html': '<div class = "ui-slider-bar-handle-inner"></div>',
			'units_pre': '',
			'units_post': '',
			'ticks_show': false,
			'ticks_values': [slider_min, slider_max],
			'ticks_class': 'ui-slider-ticks',
			'ticks_values_container_class': 'ui-slider-ticks-values-container',
			'ticks_value_class': 'ui-slider-ticks-value',
			'info_html': '',
			'info_show': true,
			'info_class': 'ui-slider-info',
			'label': '',
			'label_class': 'ui-slider-info-label',
			'handle_values_class': 'ui-slider-info-values',	//The div containing the various value spans
			'handle_info_class': 'ui-slider-info-values-value',			//A span containing a handle's value
			'delimiter': ' - ',
			'delimiter_class': 'ui-slider-info-values-delimiter',
		};
	*/
	var createElm =function(params)
	{
		var html = "";
		html +="<div>";
			html +="<ui-slider slider-id = '{{id}}' slider-handle-variable = '" + params.handle_var + "' slider-opts = 'opts'> </ui-slider>";
		html +="</div>";
		elm =angular.element(html);
		
		scope.id = params.id;
		scope.opts = params.opts;
		
		
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
	
	it('should make a basic slider', function()
	{
		var params = {};
		params.id = 'myslider';
		params.handle_var = 'my_handles';
		params.opts = {};	//Use all defaults
		
		createElm(params);
		
		expect(scope.my_handles).toBeDefined();
		expect(scope.my_handles.length).toEqual(1);
	});
});