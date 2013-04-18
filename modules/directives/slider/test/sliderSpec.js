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
		params.id = 'myslider1';
		params.handle_var = 'my_handles1';
		params.opts = {};	//Use all defaults
		
		createElm(params);
		scope.$on('evtSliderInitialized' + params.id, function(evt, ret1)
		{
			expect(scope.my_handles1).toBeDefined();
			expect(scope.my_handles1.length).toEqual(1);
		});
	});
	
	it('should use the specified options, initialize values, and its setter/getter events should work', function()
	{
		scope.my_handles2 = [1100, 3500, 7300, 9000];	//Set initial values for handles
		var params = {};
		
		params.id = 'myslider2';
		params.handle_var = 'my_handles2';
		params.opts = 
		{
			'num_handles': '4',
			'slider_min': '1000',
			'slider_max': '10000',
			'precision': '-2',
			'scale_string': '[-1, 1], [0, 1]'
		};
		
		createElm(params);
		
		var initial = true;
		
		scope.$on('evtSliderInitialized' + params.id, function(evt, ret0)
		{
			if(initial === true)
			{
				initial = false;
				
				//Verify initial values were used
				expect(scope.my_handles2.length).toEqual(4);
				expect(scope.my_handles2[0]).toEqual(1100);
				expect(scope.my_handles2[1]).toEqual(3500);
				expect(scope.my_handles2[2]).toEqual(7300);
				expect(scope.my_handles2[3]).toEqual(9000);
				
				//Test events
				scope.$broadcast('evtSliderGetValue' + params.id, {'handle' : 2});		//Get third handle
				scope.$on('evtSliderReturnValue' + params.id, function(evt, ret)
				{
					expect(ret.value).toEqual(scope.my_handles2[2]);
				});
				
				scope.$broadcast('evtSliderGetAllValues' + params.id, {});	//Get all handles
				scope.$on('evtSliderReturnAllValues' + params.id, function(evt, ret1)
				{
					expect(ret1.values.length).toEqual(4);
					expect(ret1.values[0]).toEqual(scope.my_handles2[0]);
					expect(ret1.values[1]).toEqual(scope.my_handles2[1]);
					expect(ret1.values[2]).toEqual(scope.my_handles2[2]);
					expect(ret1.values[3]).toEqual(scope.my_handles2[3]);
					
					//Set a handle
					scope.$broadcast('evtSliderSetValue' + params.id, {'handle' : 0, 'value' :1200});
					expect(scope.my_handles2[0]).toEqual(1200);
					
					//Set all handles then re-init
					scope.my_handles2 = [1300, 3600, 7400, 9100];
					scope.$broadcast('evtInitSlider' + params.id, {});
					scope.$on('evtSliderInitialized' + params.id, function(evt, ret2)
					{
						expect(ret2.id).toEqual(params.id);
						expect(ret2.values.length).toEqual(4);
						expect(ret2.values[0]).toEqual(scope.my_handles2[0]);
						expect(ret2.values[1]).toEqual(scope.my_handles2[1]);
						expect(ret2.values[2]).toEqual(scope.my_handles2[2]);
						expect(ret2.values[3]).toEqual(scope.my_handles2[3]);
					});
				});
			}
		});
	});
});