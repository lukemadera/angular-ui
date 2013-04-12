//Slider directive

//Creates a slider on the page.
//Example Calls:
	//HTML:
	//		<ui-slider slider-id = 'my-slider' slider-handle-variable = 'my_var'> </ui-slider>
	//		<ui-slider slider-id = 'my-slider' slider-handle-variable = 'my_var' slider-opts = '{num_handles : 2, slider-min : 0, slider-max : 50}'> </ui-slider>
	
//Full example:
	//HTML:
	//		<ui-slider slider-id = 'my-slider' slider-handle-variable = 'my_var' slider-opts = 'opts'> </ui-slider>

	//JAVASCRIPT:
	//	This is an example of a full slider-opts object, with every field defined and set to its default value. You can and should remove unneeded keys.
	//	This object would be defined in the controller of the html creating the slider.
	//	I recommend copying and pasting this object into your controller. Then you can change its name, adjust values, and delete keys you don't need.
/*	
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

//****************************************************************************
//READING VALUES
//Option 1:
//Use the variable you specified for slider-handle-variable

//Option 2:
//To read a value from the slider, you must know the slider_id. This is necessary since there may be multiple sliders in the same parent element.
//To read a value from a single handle, you must know the handle's index. If you do not give an index, you will receive the first (leftmost) handle's value.
//Handles are zero-indexed, and arranged in increasing order from left to right.

//The following sample code would get the value of the 3rd handle from the left (index 2).

//var evtReadSliderValue = 'evtSliderGetValue' + slider_id;
//$scope.$broadcast(evtReadSliderValue, {'handle' : 2});					//tell directive to report the third handle's value

//var evtReceiveSliderValue = 'evtSliderReturnValue' + slider_id;
//$scope.$on(evtReceiveSliderValue, function(evt, params) {				//Listen for the directive's response
//	var handle_value = params.value;															//The directive will return {'value' : val}
// });

//To read all handle values, you need only the slider_id. The directive will return a scalar array of the handle values.
//The array will be arranged in order of the handles, which should be in ascending order for the values.
//This method always returns an array, even if there's only one handle, and even if you have set opts.use_array = 'false'

//Sample code:
//var evtReadAllSliderValues = 'evtSliderGetAllValues' + slider_id;
//$scope.$broadcast(evtReadAllSliderValues, {});											//tell directive to report all values

//var evtReceiveAllSliderValues = 'evtSliderReturnAllValues' + slider_id;
//$scope.$on(evtReceiveAllSliderValues, function(evt, params) {				//Listen for the directive's response
//	var values_array = params.values;																	//The directive will return {'values' : [num1, num2, num3... ]}
// });

//Option 3:
//You can specify an opts.evt_mouseup name. If defined, an event with this name will fire whenever a handle finishes moving.
//The event will come with a params object containing, among other things, the value of the most recently moved handle.
//See evt_mouseup in the documentation below for more details.


//****************************************************************************
//SETTING VALUES
//To set a value on the slider, you must know the slider_id, just as with reading values.

//Be careful when setting values; do not count on the directive for error checking.
//Handles should stay in order; do not place the 4th handle to the left of the 3rd, for example.
//Handles should be set to a valid slider value. Do not set a handle to a value outside the slider's range.
//For increment sliders, be wary of placing a handle at a position that is not a valid increment.
//Failing to abide by these rules will probably not cause any fatal errors, but could easily result in display problems.

//The directive will auto-correct the handle if the user tries to place it outside its order or outside the slider.
//The directive will not prevent you from manually setting a handle not on a valid increment, but doing so may or may not cause minor issues.

//Option 1 (Recommended): Use the event.
//Sample Code: Sets the leftmost handle to the value 29.3
//var evtSetSliderValue = 'evtSliderSetValue' + slider_id;
//$scope.$broadcast(evtSetSliderValue, {'handle' : 0, 'value' :29.3});

//Option 2 (Not Recommended): Use the handle-variable you gave when defining the slider and re-init.
//Ordinarily, the handle-variable should be treated as read-only. However, if you manually adjust the variable's values and then
//	immediately initialize the slider, the handles should adjust accordingly. In general this method will be very inefficient; use only
//	if you intend to re-initialize the slider anyway, and want to change the handles while you're at it.

//****************************************************************************
//RE-INITIALIZE THE SLIDER
//To reset and reconstruct the slider, you must know the slider_id. Broadcast the event as in the sample code.
//	You should re-initialize the slider after adjusting any of the slider-opts in your controller. Otherwise, your changes
//	will not take effect. Re-initializing can also solve angular timing issues, if the directive was called before values were correctly
//	interpolated.
//	Be aware that handles will be reset upon initialization to match the values in your specified handle-variable.
//	If you wish to change a slider-option back to its default, you must either manually set it to its default value or delete the key from
//	the options array.
//	Note: The slider will re-initialize itself if it detects a change to its ID.

//Sample Code:
//	var evtInitSlider = 'evtInitSlider' + slider_id;
//	$scope.$broadcast(evtInitSlider, {});


//****************************************************************************
// A slider is composed of several elements, with the following structure. This particular example has two handles (a range slider):
//	<div>									//the container div. Holds the whole slider.
//		<div>								//the info div. container for the slider's label, values, etc.
//			<div>							//the label div. holds the label for the slider, if one exists.
//			</div>

//			<div>							//the handle-values div. Holds the various handle-info spans, plus delimiters.
//				<span>					//A handle-info span. Each handle on the slider has one. Shows the handle's value.
//					<span> slider-delimiter </span>			//A delimiter span. Placed in-between handle-info spans. Default delimiter is ' - '. First delimiter is hidden.
//					<span></span>												//Handle's value placed in this span.
//				</span>
//				<span>																//Next handle-info span, if it exists.
//					<span> slider-delimiter </span>
//					<span></span>
//				</span>
//			</div>

//		</div>

//		<div>								//the slider-bar div. Holds the actual slider itself.
//			<div>							//The slider itself. Will be as wide as the slider-bar div.
//				<div></div>				//the background-left div. The area to the left of the slider's leftmost handle.
//				<div></div>				//A handle div. This is the leftmost handle.
//				<div></div>				//Another handle.
//				<div></div>				//the background-interior div. The area between slider handles.
//				<div></div>				//the background-right div. The area to the right of the slider's rightmost handle.
//				<div></div>				//A tick on the slider
//				<div></div>				//Another tick
//			<div>
//		</div>
//		<div>								//Tick Values container
//			<div></div>					//A tick value
//			<div></div>					//A tick value
//		</div>
//	</div>


//The slider may be defined using the following attributes:

//REQUIRED attributes:
//slider-id: A string. Use it to distinguish this slider from others when reading or writing handle values.
//	Note: This will be the id of the slider's container div.
//	Will also be used to create ids for the slider's handles so that jQuery events can be bound to them.
	//Ex: slider-id = 'slider1'
	
//slider-handle-variable: A name of a variable in the parent scope. This variable will be filled with a scalar array of the values of the handles on the slider.
//	Handles are zero-indexed and increase from left to right. Even if there is only one handle, this will still be an ARRAY by default (see the use_array attribute).
//	The binding is bi-directional, i.e. changing the variable in the parent will alter a corresponding array in the slider's scope. However, I strongly recommend
//	that users treat the parent's variable as read-only, since changing it yourself will almost certainly not have the effect you intended in the slider, and could
//	potentially cause errors (unless you re-initialize the slider immediately). If you wish to change a slider value, use the method outlined under SETTING VALUES above instead.
//	Problems could result if this attribute is not specified for two or more sliders with the same immediate parent scope. Thus, this attribute is required.
//		The variable may be pre-filled with an array of default values, which will then be used to start the handles at the given positions. Be sure the values are valid.
//		Due to timing issues, however, I'm not necessarily convinced that this will always work as intended.
//		It certainly WON'T work if the variable is filled via a timeout or some other delay. It needs to be pre-filled before the directive linking function is called.
//		Upon initializing the slider, the handles will be set to the values stored in this variable. Beware of this when re-initializing the slider yourself.
	//Ex: slider-handle-variable = 'my_var'. Then, in the parent controller, you will have access to the first handle's value as $scope.my_var[0]. Default: 'handle_values'.

//OPTIONAL attributes:
// These should be keys in an object set to the 'slider-opts' attribute.
// All values should be converted to STRINGS except where otherwise noted.
// It is highly recommended that you define this object in your javascript controller, rather than directly in the html.
// Defining it in html still works, but you may run into trouble with special character exception errors when using certain attributes (like handle_html).
// Furthermore, defining it in html causes angular to fire thousands of digests whenever the user interacts with the slider.
// This doesn't cause errors, but it's not good for performance. It also overflows the console's error log, which is annoying.

//num_handles: Number of handles for the slider to have. A positive integer. May be input as number or string.
	//Ex: num_handles : '2'. Default: '1'
	
//slider_min: Minimum value for the slider. A number. May be input as number or string.
	//Ex: slider_min : '25.5'. Default: '0'
	
//slider_max: Maximum value for the slider. A number. May be input as number or string.
	//Ex: slider_max: '74'. Default: '100'

//precision: Integer. Tells the slider how far past the decimal point to go when displaying/reporting values. Effects internal accuracy. Negative values allowed.
//	May be input as number or string.
//	A precision of 2 would cause 1.236 to be stored and reported as 1.24. A precision of -2 would cause 1234 to be stored and reported as 1200.
	//Ex: precision: '2'. Default: '0'
	//Protip: You can use this attribute to create continuous-motion sliders with power-of-ten increments.

//scale_string: A ~ delimited string of arrays specifying the function to use to map the position on the slider to a value on the slider.
//Use this attribute to define non-linear continuous sliders. Meaningless for increment sliders.
//The function should be a non-decreasing mathematical function passing through (0, 0) and (1, 1), where the first coordinate represents
//the slider's left% as a decimal (a number between 0 and 1, with 0 being the left edge of the slider, 1 being the right edge of the slider)
//and the second represents the slider's values, linearly mapped to the interval [0, 1], with 0 = slider_min, 1 = slider_max.
//Input format: "[coefficient, exponent]~[coefficient, exponent]~..."
//Example: [1, .5] defines the function f(x) = 1 * x^(.5), which in turn means the slider progresses through values more quickly on the left than on the right,
//	with the halfway point at 25% of the slider's length. The default is a linear slider: f(x) = x
//	Limitations: Can only use polynomial functions. Non-integer exponents are allowed. Negative exponents are not allowed (would cause division-by-zero error).
//	Again, be sure that your function goes through (0, 0) and (1, 1), and is never decreasing on [0, 1], or your slider will not make sense!
//	Note - a strictly non-increasing function on [0, 1] passing through (0, 1) and (1, 0) would also be valid*.
//		*Protip: Use such a function to place the maximum on the left and the minimum on the right.
//		Mathematician's Protip: If you must use a non-polynomial function, use that function's Taylor series. If you don't understand Taylor series, hire a math major.
	//Ex: scale_string: '[1, 2]'. Default: '[1, 1]'
	
//zero_method: String, either "newton" or "bisection". Defines what method to use when converting a slider value to a left% on the slider using the given scale polynomial.
//	The default behavior is "newton": Newton's method is used to find a zero. If it fails, the bisection method is then used.
//	Newton's method is generally significantly faster, but may fail for certain polynomials. The bisection method is slower, but guaranteed to succeed if your slider's
//	polynomial satisfies the criteria above, namely: non-decreasing continuous and passing through (0, 0) and (1, 1), or non-increasing continuous and passing through
//	(0, 1) and (1, 0).
//	If Newton's method is consistently failing for your function (an error message will be displayed in the console each time it fails), you can set this attribute
//	to "bisection" to skip Newton's method and go straight to bisection, for a performance boost.
	//Ex: zero_method: 'bisection'. Default: 'newton'
	
//increment: A positive number. May be input as number or string.
//	If this attribute is set, the handles on the slider will snap to increments of this number,
//	disallowing intermediate values.
//	The increments are determined starting from the leftmost point of the slider (slider_min).
//	The maximum point of the slider need not be one of these increments.
//	If this attribute is set, the scale_string attribute is meaningless.
//	If this attribute is not set, the slider will be continous.
//	Make sure you have the resolution to correctly display all your increments! You can't fit 1000 points on a slider that's only 100 pixels wide.
	//Ex: slider-increment = '2'. Default: '0' (continuous)

//user_values: A scalar array [] of values for the slider. If this attribute is specified, the slider automatically becomes an increment slider,
//	with the values in the array evenly spread out along it, in their given order.
//	Note: The increment, slider_min, slider_max, scale_string, and precision attributes are meaningless if this attribute is set.
//	There are several ways to define the entries of this array:
//		1) Make the entries the values. Ex: user_values: [25, 83, 'Stephen Colbert', 'Johnny']
//		2) Make the entry an object with a 'val' property. Ex: user_values: [{'val': 25}, {'val': 83}, {'val': 'Stephen Colbert'}, {'val': 'Johnny'}]
//		3) Make the entry an object with 'val' and 'name' properties. Ex: user_values: [{'val': 25, 'name': "Twenty-five"}, {'val': 1230, 'name':"12:30PM"}]
//	The 'val' property is what will be returned to the user whenever they look up a value. The 'name' property is what the slider will write to the page when
//	displaying a value on its own.
//	Regardless of the input format, all entries will be internally converted to the third format. If 'name' is undefined, 'val' is used as the 'name'.
//	Each entry is independent. You may use any of the three formats for an entry, regardless of the format used for neighboring entries.
	//Ex: user_values: '[25, {'val': 1230, 'name':"12:30PM"}, "Stephen Colbert", {'val': "Johnny"}]. This would create a slider with 4 increments. Default: ''

//evt_mouseup: Name of an event to fire when a handle is released, so you can listen for it with $scope.$on elsewhere.
//	Also fires after the user clicks the slider to move a handle.
	//Ex: evt_mouseup: 'evtHandleStop'. Default: '' (no event fires)
	//When fired, the event will come with a params object holding the following information:
		//params
			//num_handles				//Integer. Number of handles on this slider
			//id								//String. ID of the slider
			//handle						//Index of the most recently moved handle.
			//value							//New value of the handle

//slider_moveable: Boolean. True iff there is a chance that the slider may move about the page. May be input as boolean or string.
//This is very important because moving the handles depends on the position of the mouse. When the slider is first touched, jquery is used to determine
//the slider's width and horizontal offsets, so that the mouse's coordinates can be translated to a position on the slider.
//If at any time after the initial definition of these offsets, the slider's position or width on the page changes, then the offsets need to be reset.
//So, if this value is set to true, the slider will recalculate the offsets every time the user interacts with the slider.
//Set this value to false (for a small efficiency boost) only if you are sure that the slider (and its containing div) will not move around.
	//Ex: slider_moveable: 'false'.	Default: 'true'

//use_array: Boolean. False iff the slider should treat single-handle sliders as a special case, returning the value rather than a single-element array of values.
//	Do NOT set this attribute to 'false' if the slider has more than one handle!! This would make no sense and could also cause errors.
//	May be input as boolean or string.
	//Ex: use_array: 'false'. Default: 'true'
	
//container_class: class for the div that contains everything. You probably won't need this.
	//Ex: container_class: 'my-slider-container'. Default: 'ui-slider'

//bar_container_class: Class for the slider bar container. The (inner) width of this element will determine the width of the slider.
//	Note: If you set this attribute, the container will have 0 height unless you give it a height.
	//Ex: bar_container_class : 'my-slider-bar'. Default: 'ui-slider-bar'
	
//left_bg_class: Class for the slider area to the left of the leftmost handle. Use to style said area.
	//Ex: left_bg_class : 'my-slider-left-area'. Default: 'ui-slider-bar-active'

//interior_bg_class: Class for the slider area between handles. Use to style said area (does not exist if only one handle)
	//Ex: interior_bg_class: 'my-slider-interior-area'. Default: 'ui-slider-bar-active'
	//Protip: Use nth-of-type selectors to target individual interior areas if there are 3 or more handles.

//right_bg_class: Class for the slider area to the right of the rightmost handle. Use to style said area.
	//Ex: right_bg_class: 'my-slider-right-area'. Default: 'ui-slider-bar-inactive'

//handle_class: class for the handles. Use to style them.
	//Ex: handle_class: 'my-slider-handles'. Default: 'ui-slider-bar-handle'
	//Protip: Use nth-of-type selectors to target individual handles.
	//Note: If you're going to use your own handle styles, I strongly recommend giving the handles "margin-left: -Xpx;",
	//	where X is half the handle's width. This will align the middle of the handle with the value it represents.

//handle_html: A string of html. Use this attribute to put something inside a handle.
// By default, the same html will be placed in each handle. However, you may specify different html for each handle by using a ~ delimited string.
// Limitations: Can only use plain html - no angular directives or scope variables allowed, unless they are evaluated before being sent to this directive.
	//Exception: A handle's value can be displayed using '$$value'
	//Ex: handle_html: '<div class = "my-handle-interior"> </div>'						//This html is applied to every single handle
	//Ex: handle_html: '<div> 1 </div>~<div> 2 </div>'												//First handle has a 1 in it, second has a 2. Any additional handles have no inner html.
	//Ex: handle_html: '<div> $$value </div>'																	//Each handle will have its value displayed inside itself.
	//Default: '<div class = "ui-slider-bar-handle-inner"></div>'
	
//units_pre: String, placed before values that the slider writes to the page.
//Does not affect values returned to the user.
	//Ex: units_pre: '$'. Default: ''

//units_post: String, placed immediately after values that the slider writes to the page.
//Does not affect values returned to the user.
	//Ex: units_post: ' meters/second'. Default: ''
		
//ticks_show: Boolean. True iff ticks should be shown. May be input as boolean or string.
	//Ex: ticks_show: 'true'. Default: 'false'

//ticks_values: Array of slider values at which to display ticks, and what to display at that tick. Meaningless if ticks_show is false.
//	There are several ways to define the entries of this array, precisely as with user_values:
//		1) Make the entries the values. Ex: ticks_values: [25, 83, 47, 100]
//		2) Make the entry an object with a 'val' property. Ex: ticks_values: [{'val': 25}, {'val': 83}, {'val': 47}, {'val': 100}]
//		3) Make the entry an object with 'val' and 'name' properties. Ex: ticks_values: [{'val': 25, 'name': "Twenty-five"}, {'val': 83, 'name':"83 m/s"}]
//	In the first and second case, the value displayed below the tick will be the value itself prefixed by units_pre and suffixed by units_post.
//	In the third case, the value displayed below the tick will be exactly the 'name'.
//	The user is responsible	for ensuring that each 'value' exists on the slider,
//	particularly in the case of increment sliders and sliders with user-defined values.
//	By default, the slider's minimum value and maximum value will be the only ticks shown.
//	Note: It is recommended (but not necessary) that the values in this array be sorted from least (leftmost) to greatest (rightmost).
//	This will keep the html in a logical order, so that nth-child selectors on the ticks' classes will make more sense.
	//Ex: ticks_values:[0, 25, 50, 75, 100]. Default: [slider_min, slider_max]

//ticks_class: String. Class name for the ticks divs. Use to style them.
//	A tick is just a div. Its left edge is at the position of the specified value, inside the slider.
//	Protip: Use nth-of-type selectors to target individual ticks.
	//Ex: ticks_class: 'my-slider-ticks'. Default: 'ui-slider-ticks'

//ticks_values_container_class: String. Class name for the div containing the tick values. This div has position:relative and is placed immediately
//	after the slider in the html, meaning it is on top of the slider itself.
	//Ex: ticks_values_container_class: 'my-slider-ticks-container'. Default: 'ui-slider-ticks-values-container'
	
//ticks_value_class: String. Class name for the tick values divs. Use to style them.
//	These divs are absolutely positioned with their left edge aligned with the tick.
//	The default class gives them large widths, transparent backgrounds, top, negative margin-left (half the width), and text-align:center in order
//	to ensure that the value is centered below the tick. Therefore, if you use your own class,
//	be aware that you will have to re-position the values yourself.
//	Protip: Use nth-of-type selectors to target individual ticks.
//	Protip: Use negative 'top' css to place the tick values above the slider.
	//Ex: ticks_min_class: 'my-slider-ticks-value'. Default: 'ui-slider-ticks-value'

	// **************************************************************************************
	//NOTE: The following info-related attributes are functional but deprecated.
	//	You're probably better off setting info_show to false (hiding the default values display section), and just building
	//	your own display without the directive's help, rather than attempting to configure this setup to fit your needs.
	//	You should have the necessary values available in your handle-variable.
	// **************************************************************************************
	
//info_html: A string of html, defining how to display the handle info and labels.
// By setting this attribute, the default info section is hidden and the user takes full responisbility for the display of the slider values.
// If this attribute is set, all other info-related attributes (labels, handle_info/values classes, delimiters, etc.) are meaningless.
// The info_class attribute still applies, however; the html you define will be wrapped in a div with this class.
// The value of a handle may be referenced in this string using '$$valueN', where N is the index of the handle in question.
// Remember that handles are zero-indexed and arranged in increasing order from left to right.
// Limitations: Can only use plain html - no angular directives or scope variables, unless they are evaluated before being sent to this directive.
// Defining your own info section may or may not result in a noticeable decrease in performance, especially while dragging a handle. Be warned.
	//Ex: info_html: '<div class = 'my-slider-info'> <div class = 'my-label'> Price: $ <span> $$value0 </span> </div></div>'.		Default: ''
	
//info_show: Boolean. False iff the info div is hidden. Use to make the labels section disappear. May be input as boolean or string.
	//Ex: info_show: 'false'. Default: 'true'
	//Tip: Ignore this attribute unless you want to hide the info div. (You can easily make your own, elsewhere)
	
//info_class: Class for the labels section. Use to position or otherwise style this area.
	//Ex: info_class: 'my-slider-info-container'. Default: 'ui-slider-info'

//label: Text to put in the slider label div.
	//Ex: label: 'Price range:'. Default: ''

//label_class: class for the label div. Use to style it.
	//Ex: label_class: 'my-label-class'. Default: 'ui-slider-info-label'
	
//handle_values_class: class for the values section. Use to style it.
	//Ex: handle_values_class: 'my-handle-values-display'. Default: 'ui-slider-info-values'

//handle_info_class: class for the handle info spans. Use to style them.
	//Ex: handle_info_class: 'my-handle-info'. Default: 'ui-slider-info-values-value'

//delimiter: text to place inbetween handle values. Matters only if there is more than 1 handle.
	//Ex: delimiter: ' < '. Default: ' - '

//delimiter_class: class for the delimiter spans. Use to style them.
	//Ex: delimiter_class: 'my-delimiter'. Default: 'ui-slider-info-values-delimiter'
	
angular.module('ui.directives').directive('uiSlider', ['uiPolynomial', 'uiSliderService', function(uiPolynomial, uiSliderService)
{
	var template_html = '';

	template_html += "<div id = '{{slider_id}}' ng-mousemove = 'mousemoveHandler($event); $event.preventDefault()' class = '{{container_class}}'>";
	
		//Default info section
		template_html += "<div ng-show = 'info_show' class = '{{info_class}}'>";
			template_html += "<div class = '{{label_class}}'> {{label}} </div>";
		
			template_html += "<div class = '{{handle_values_class}}'>";
				template_html += "<span class = '{{handle_info_class}}' ng-repeat = 'handle in handles'>";
					template_html += "<span class = '{{delimiter_class}}' ng-hide = '$first'> {{delimiter}} </span>";
					template_html += "<span> {{units_pre + handle.display_value + units_post}} </span>";
				template_html += "</span>";
			template_html += "</div>";	
		template_html += "</div>";
		
		//User-defined info section
		template_html += "<div ng-show = 'user_info_show' class = '{{info_class}}' ng-bind-html-unsafe = 'user_info_html'></div>";
		
		template_html += "<div ng-click = 'barClickHandler($event)' class = '{{bar_container_class}}' style = '{{bar_container_style}}'>";
			template_html += "<div id = '{{slider_id}}SliderBar' style = '{{slider_bar_style}}'>";
				template_html += "<div class = '{{left_bg_class}}' style = 'width:{{left_bg_width}}%; {{left_bg_style}}'> </div>";
				template_html += "<div ng-repeat = 'handle in handles' id = '{{slider_id}}Handle{{$index}}' ng-mousedown = 'startHandleDrag($index); $event.preventDefault()' class = '{{handle_class}}' style = 'z-index: {{handle.zindex}}; left: {{handle.left}}%; {{handle_style}}' ng-bind-html-unsafe = 'handle.innerhtml'></div>";
				template_html += "<div ng-repeat = 'interior in interiors' class = '{{interior_bg_class}}' style = 'left: {{interior.left}}%; width: {{interior.width}}%; {{interior_bg_style}}'> </div>";
				template_html += "<div class = '{{right_bg_class}}' style = 'width:{{right_bg_width}}%; {{right_bg_style}}'> </div>";
				template_html += "<div>";			//Dummy div to wrap ticks, so nth-of-type selectors will work (they ought to work without the wrapper, but don't)
					template_html += "<div ng-repeat = 'tick in ticks' class = '{{ticks_class}}' style = 'position: absolute; left:{{tick.left}}%;'> </div>";		//If ticks_show not true, scope.ticks will be empty. Thus we don't need an ng-show here.
				template_html += "</div>";
			template_html += "</div>";
			
			template_html += "<div class = '{{ticks_values_container_class}}' style = 'position: relative;' ng-show = 'ticks_show'>";
				template_html += "<div ng-repeat = 'tick in ticks' class = '{{ticks_value_class}}' style = 'position: absolute; left:{{tick.left}}%;'> {{tick.name}} </div>";
			template_html += "</div>";
		template_html += "</div>";
	template_html += "</div>";
	
	
	return {
		restrict: 'E',
		priority: 0,
		scope: {
			'handle_values': '=sliderHandleVariable',
			'slider_id': '@sliderId',
			'slider_opts': '=sliderOpts'
		},
		replace: true,
		template: template_html,
		
		link: function(scope, element, attrs)
		{
			//variables
			var ii;
			var xx;
			var defaults;
			var building_slider;			//Boolean. True iff the slider is being built.
			var building_queued;			//Boolean. True iff the slider needs to be rebuilt again.
			var initial_values;				//If the user put an array of values in their sliderHandleVariable, then initial_values will remember
																	//those values and set the slider's handles accordingly by default.
																	//If the user did not pre-fill their handle variable, initial_values will be boolean false.
			var scale_function_poly;	//A non-decreasing mathematical function passing through (0, 0) and (1, 1),
																	//where the first coordinate represents the slider's left% as a decimal
																	//and the second represents the slider's value, with 0 = slider_min, 1 = slider_max,
																	//represented as a polynomial abstract data type.
			var cur_handle;						//Index of handle currently being dragged.
			var dragging;							//Boolean. True iff we're dragging a handle.
			var slider_offset;				//the x-offset of the slider bar. Needed when translating the mouse's position to a slider position.
			var slider_width;					//the width of the slider bar. Needed when translating the mouse's position to a slider position.
			var slider_init;					//Boolean. True iff the slider_offset and slider_width values have been set.
			var increments;						//Array of valid values for an increment slider
				//increments[ii]
					//left											//Number in [0, 100]. The left value for this increment (as % of slider width).
					//value											//Number in [scope.slider_min, scope.slider_max]. The value of this increment on the slider.
			var user_values_flag;			//Boolean. True iff the user has specified values to put on the slider
			
			//scope variables. Variables for user-defined attributes not listed here; see above
			
			//scope.handles							//Array containing handle information
				//scope.handles[ii]
					//zindex										//Z-index for this handle. The leftmost handle will have the highest z-index.
																				//When handles are near the slider's left edge, this trend is reversed; the rightmost handle has the highest z-index.
					//left											//Number between 0 and 100. The handle's % left on the slider.
					//value											//The value of the handle. A number between scope.slider_min and scope.slider_max. Directly related to the 'left' value.
					//display_value							//The value that gets displayed. Only different from 'value' for sliders with specific user-defined values.
					//return_value							//The value that gets returned. Only different from 'display_value' if the user defines it as such in user_values
					//innerhtml									//Html to place inside the handle.
					//html_string								//Raw html string (uninterpolated) to put in handle. Equal to innerhtml iff value_in_handle == false
					//value_in_handle						//Boolean. True iff the innerhtml has a '$$value' tag to interpolate.
					
			//scope.interiors						//Array containing info for the interior divs, between the handles. This array depends entirely on the handles.
				//scope.interiors[ii]
					//left											//Number in [0, 100]. Left position of this interior div (as % of slider).
					//width											//Number in [0, 100]. Width of this interior div (as % of slider).
					
			//scope.handle_values				//Array of handle values, linked to a variable in the parent controller.
				//scope.handle_values[ii]		//Will be identical to scope.handles[ii].display_value
			
			//The following variables represent user inputs. See the documentation above for more info.
			//The variable names here correspond to keys in scope.slider_opts
			
				//scope.num_handles										//Number of handles on the slider
				//scope.slider_min										//Minimum value of the slider
				//scope.slider_max										//Max value of the slider
				//scope.left_bg_class									//Class for slider area left of the leftmost handle
				//scope.interior_bg_class							//Class for slider area b/w handles
				//scope.right_bg_class								//Class for slider area right of rightmost handle
				//scope.bar_container_class						//Class for the slider bar container div
				//scope.handle_class									//Class for the handles
				//scope.units_pre											//Text placed before slider values
				//scope.units_post										//Text placed after slider values
				//scope.ticks_show										//Boolean. True iff the min/max values are displayed
				//scope.ticks_values									//Array of values at which to place ticks
				//scope.ticks_class										//Class for each tick div.
				//scope.ticks_values_container_class	//Class for tick values container div
				//scope.ticks_value_class							//Class for each tick value div
				//scope.info_show											//Boolean. True if the default values reporting section is displayed
				//scope.info_class										//Class for info section
				//scope.label													//Text for the label in the info section
				//scope.label_class										//Class for the label
				//scope.handle_values_class						//Class for the div containing the various value spans
				//scope.handle_info_class							//Class for a span containing a handle's value
				//scope.delimiter											//Text to place between handle values
				//scope.delimiter_class								//Class for delimiter div
				//scope.container_class								//Class for the div that contains everything
				//scope.increment											//Value to increment by, for increment sliders.
				//scope.precision											//Integer. Decimal precision to use when storing and reporting values.
				//scope.evt_mouseup										//Name of event to broadcast after a handle stops moving
				//scope.slider_moveable								//Boolean. True iff the slider may change location relative to the window
				//scope.user_values										//Array of values for the slider.
				//scope.handle_html										//Html string to put inside handles
				//scope.info_html											//User-defined html for the info section
				//scope.scale_string									//~ delimited polynomial string. Defines slider's scale function
				//scope.zero_method										//String defining which method to use to find a zero.
				//scope.use_array											//Boolean. True iff the handle values are reported as an array.
			
			//scope.slider_bar_style
			//scope.left_bg_style
			//scope.interior_bg_style		//General styles for the slider, backgrounds and handles. (ie. 'position:absolute;', etc.)
			//scope.right_bg_style
			//scope.handle_style
			
			//scope.left_bg_width				//Number in [0, 100]. Width of left background div (as % of slider).
			//scope.right_bg_width			//Number in [0, 100]. Width of right background div (as % of slider).
			
			//scope.startHandleDrag			//Mousedown handler for handles. Starts dragging the handle.
			//scope.mousemoveHandler		//Mousemove handler for the slider container.
			//scope.endHandleDrag				//Mouseup handler for the slider container. Ends any handle dragging.
			//scope.ticks								//Array of ticks on the slider
				//scope.ticks[ii]
					//val												//Value on the slider where this tick should go
					//name											//String to display for this tick
					//left											//Number in [0, 100]. The left value for this tick (as % of slider width).
			//scope.user_info_show			//Boolean. True iff the user-defined info section is shown. Default: false.
			//scope.user_info_html			//String of html, converted from info_html, defining the user-defined info section.
			
			//Define defaults
			
			defaults = 
			{
				'num_handles': '1',
				'slider_min': '0',
				'slider_max': '100',
				'left_bg_class': 'ui-slider-bar-active',
				'interior_bg_class': 'ui-slider-bar-active',
				'right_bg_class': 'ui-slider-bar-inactive',
				'bar_container_class': 'ui-slider-bar',
				'handle_class': 'ui-slider-bar-handle',
				'units_pre': '',
				'units_post': '',
				'ticks_show': false,
				'ticks_class': 'ui-slider-ticks',
				'ticks_values': 'placeholder',		//Placeholder special value
				'ticks_values_container_class': 'ui-slider-ticks-values-container',
				'ticks_value_class': 'ui-slider-ticks-value',
				'info_show': true,
				'info_class': 'ui-slider-info',
				'label': '',
				'label_class': 'ui-slider-info-label',
				'handle_values_class': 'ui-slider-info-values',	//The div containing the various value spans
				'handle_info_class': 'ui-slider-info-values-value',			//A span containing a handle's value
				'delimiter': ' - ',
				'delimiter_class': 'ui-slider-info-values-delimiter',
				'container_class': 'ui-slider',
				'increment': '0',
				'precision': '0',
				'evt_mouseup': '',
				'slider_moveable': true,
				'user_values': '',
				'handle_html': '<div class = "ui-slider-bar-handle-inner"></div>',
				'info_html': '',
				'scale_string': '[1, 1]',
				'zero_method': 'newton',
				'use_array': true
			};
			
			//Init the event name variables here so we don't get undefined reference errors. Will be properly set later.
			var evt_get_value = '';
			var evt_return_value = '';
			var evt_get_all_values = '';
			var evt_return_all_values = '';
			var evt_set_value = '';
			var evt_init_slider = '';
			
			scale_function_poly = uiPolynomial.stringToPoly('[1, 1]');	//Init to identity, avoid undefined errors.
			
			
			//Initialize and build the slider. Can't allow values to change during computation.
			//	If an attempt is made to re-init the slider while it is in the process of building,
			//	building_queued will be set to true, and the slider will re-init again upon completion.
			//	This may be somewhat inefficient, but it is the only realistic and reliable way to ensure there are no fatal errors.
			var initSlider = function()
			{
				building_slider = true;
				building_queued = false;
				//Fill info
				for(var xx in defaults)
				{
					if(scope.slider_opts[xx] === undefined)
					{
						scope[xx] = defaults[xx];
					}
					else
					{
						scope[xx] = scope.slider_opts[xx];
					}
				}
				
				if(scope.ticks_values == 'placeholder')		//If this wasn't set by the user
				{
					//Define the default. Can't put this is the defaults array because it depends on the user's min and max values.
					if(scope.user_values.length > 0)
					{
						scope.ticks_values = [scope.user_values[0], scope.user_values[scope.user_values.length - 1]];
					}
					else
					{
						scope.ticks_values = [scope.slider_min, scope.slider_max];
					}
				}
				
				nameInterfaceEvents();				//Set the event names
				uiSliderService.register(scope.slider_id, endHandleDrag);		//Register the slider with the service
				
				scope.initial_values = false;
				if(scope.handle_values === undefined)
				{
					scope.use_array = parseBoolean(scope.use_array, defaults.use_array);	//Must parse before using.
					if(scope.use_array === false)		//Arbitrarily treat single handle as special case, to bypass 1-element array.
					{
						scope.handle_values = '';		//init to empty string in this case
					}
					else
					{
						scope.handle_values = [];
					}
				}
				else
				{
					//Arbitrarily treat single handle as special case, to bypass 1-element array.
					if(isArray(scope.handle_values) === false)	//Check for array here; use_array may not be correctly defined yet, and the user ought to have it in the format they intend to use.
					{
						scope.initial_values = scope.handle_values;
					}
					else
					{
						if(scope.handle_values.length !== undefined && scope.handle_values.length > 0)		//User may have initialized to empty array; initial_values should be left false in this case.
						{
							//copy handle_values
							var array_copy = [];
							for(ii = 0; ii < scope.handle_values.length; ii++)
							{
								array_copy[ii] = scope.handle_values[ii];
							}
							scope.initial_values = array_copy;
						}
					}
				}
				
				//Call the helpers to build the slider
				parseData();
				setStyles();
				setHandles();
				if(scope.ticks_show === true)		//Form ticks if necessary. Do nothing if the ticks are hidden.
				{
					setTicks();
				}
				setJquery();
				
				building_slider = false;
				//If an attempt was made to re-init the slider while it was building, re-init now.
				if(building_queued === true)
				{
					initSlider();
				}
			};
			
			//Setup Functions
			
			var parseData = function()
			{
				//Parse numbers
				
				scope.num_handles = parseInt(scope.num_handles, 10);
				scope.slider_min = parseFloat(scope.slider_min);
				scope.slider_max = parseFloat(scope.slider_max);
				scope.increment = parseFloat(scope.increment);
				scope.precision = parseInt(scope.precision, 10);
				
				//Parse Booleans
				scope.slider_moveable = parseBoolean(scope.slider_moveable, defaults.slider_moveable);
				scope.info_show = parseBoolean(scope.info_show, defaults.info_show);
				scope.use_array = parseBoolean(scope.use_array, defaults.use_array);
				
				user_values_flag = false;
				//If set, parse Values and re-define other values
				if(scope.user_values !== '' && scope.user_values !== undefined)
				{
					user_values_flag = true;
					for(ii = 0; ii < scope.user_values.length; ii++)
					{
						if(scope.user_values[ii].val === undefined)		//If val is undefined, then the entry itself is the value.
						{
							var temp_val = scope.user_values[ii];
							scope.user_values[ii] = {'val':temp_val, 'name':temp_val};
						}
						else if(scope.user_values[ii].name === undefined)
						{
							scope.user_values[ii].name = scope.user_values[ii].val;
						}
					}					
					
					//set up slider numbers so that the value on the slider corresponds to the index of the appropriate value in user_values
					scope.slider_min = 0;
					scope.slider_max = scope.user_values.length - 1;
					scope.increment = 1;
					scope.precision = 0;
				}
				
				//Initialize variables
				scope.left_bg_width = 0;
				scope.right_bg_width = 0;
				cur_handle = 0;
				dragging = false;
				scope.recent_dragging = false;
				scope.handles = [];
				scope.interiors = [];
				scope.ticks = [];
				slider_offset = 0;			//Init to 0; will set later
				slider_width = 100;			//Init to 100; will set later
				slider_init = false;
				increments = [];
				scope.user_info_show = false;
				scope.user_info_html = '';
				
				//Parse scale, form scale function
				
				if(scope.increment === 0)								//If not increment slider, re-form scale polynomial
				{
					scale_function_poly = uiPolynomial.stringToPoly(scope.scale_string);
				}
				
			};	//end parseData
			
			//Boolean parser helper - string to boolean.
			var parseBoolean = function(bool, default_val)
			{
				if(bool == 'false' || bool === false)
				{
					return false;
				}
				else if(bool == 'true' || bool === true)
				{
					return true;
				}
				else
				{
					return default_val;
				}
			};
			
			
			var setStyles = function()
			{			
				//Setup needed bar styles
				scope.slider_bar_style = 'position:relative; width:100%;';
				scope.left_bg_style = 'position:absolute; left:0%;';				//width varies depending on handle position; define separately.
				scope.interior_bg_style = 'position:absolute;';							//left, width varies depending on handles. Define separately.
				scope.right_bg_style = 'position:absolute; right:0%;';			//width varies depending on handle position; define separately.
				scope.handle_style = 'position:absolute;';
				scope.bar_container_style = '';		//No styles needed here anymore
				
			};	//End setStyles
			
			
			
			var setHandles = function()
			{
				//Set up handles
				//Parse handle html, fill handle_htmls array with html for each handle.
				var handle_htmls;
				
				if(scope.handle_html.indexOf('~') != -1)		//If the user specified individual html for each handle
				{
					handle_htmls = scope.handle_html.split('~');
					for(ii = handle_htmls.length; ii < scope.num_handles; ii++)
					{
						handle_htmls[ii] = '';			//Blank out the rest of the array if necessary
					}
				}
				else
				{
					//Either scope.handle_html is the default, or it is the user-defined html. Either way, it should be applied to every handle.
					handle_htmls = [];
					for(ii = 0; ii < scope.num_handles; ii++)
					{
						handle_htmls[ii] = scope.handle_html;
					}
				}
				
				//Now fill scope.handles
				for(ii = 0; ii < scope.num_handles; ii++)
				{
					var left_val;
					if(scope.num_handles == 1)		//Need to check this case to avoid division by zero.
					{
						left_val = 0;
						scope.right_bg_width = 100;		//Also, in this case, there is no handle on the right, so the right background does not have 0 width. Might as well update it here.
					}
					else
					{
						left_val = (100 / (scope.num_handles - 1)) * ii;		//Start the handles evenly spread out on the bar
					}
					
					var value_in_handle = false;
					if(handle_htmls[ii].indexOf('$$value') != -1)
					{
						value_in_handle = true;
					}
					
					scope.handles[ii] =
					{
						'zindex' : 10,							//placeholder value
						'left' : left_val,
						'value' : calculate_value(left_val),						//Calculate value based on position
						'html_string': handle_htmls[ii],
						'value_in_handle': value_in_handle
					};
					if(user_values_flag === false)
					{
						scope.handles[ii].display_value = scope.handles[ii].value;
						scope.handles[ii].return_value = scope.handles[ii].value;
					}
					else
					{
						scope.handles[ii].display_value = scope.user_values[scope.handles[ii].value].name;
						scope.handles[ii].return_value = scope.user_values[scope.handles[ii].value].val;
					}
					
					
					if(scope.use_array === false)		//Arbitrarily treat single handle as special case, to bypass 1-element array.
					{
						scope.handle_values = scope.handles[ii].return_value;		//link to parent scope variable
					}
					else
					{
						scope.handle_values[ii] = scope.handles[ii].return_value;	//link to parent scope variable	
					}					
					update_zindex(ii);			//Set the zindex field properly
					
					//set innerhtml field
					if(scope.handles[ii].value_in_handle === true)		//Interpolate innerhtml if necessary
					{
						parseHandleHtml(ii);
					}
					else
					{
						scope.handles[ii].innerhtml = scope.handles[ii].html_string;
					}
				}
				
				//Set up interiors - must define them now, before we try to move any handles
				for(ii = 0; ii < scope.num_handles - 1; ii++)
				{
					scope.interiors[ii] = 
					{
						'left' : scope.handles[ii].left,	//interior div has same left position as handle on its left
						'width' : scope.handles[ii+1].left - scope.handles[ii].left
					};
				}
				
				//Set up increments if necessary
				if(scope.increment !== 0 && scope.increment !== undefined)		//If this is an increment slider
				{
					var cur_val = scope.slider_min;
					for(ii=0; cur_val < scope.slider_max; ii++)
					{
						increments[ii] = {};
						increments[ii].value = cur_val;
						increments[ii].left = calculate_left(cur_val);
						cur_val += scope.increment;
					}
					increments[ii] = {};
					increments[ii].value = scope.slider_max;
					increments[ii].left = 100;
					
					if(scope.initial_values === false)		//If the user pre-filled their values, don't bother with this section, we're going to move every handle again anyway.
					{
						//Now, move each handle to the nearest valid increment
						
						//Cannot simply use findNearestIncrement and moveHandle, because this might try to move a handle beyond its adjacent handles.
						//We must move the handles in order of which is closest to its nearest increment
						//Recall that, at this point, the handles are evenly spaced along the slider.
					
					
						var distances_to_increment = [];
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							var new_left = findNearestIncrement(scope.handles[ii].left);
							distances_to_increment[ii] = 
							{
								'handle' : ii,
								'distance' : Math.abs(scope.handles[ii].left - new_left),
								'new_left' : new_left
							};
						}
						
						distances_to_increment.sort(function(a, b)
						{
							if(a.distance < b.distance)
							{
								return -1;
							}
							else if(b.distance < a.distance)
							{
								return 1;
							}
							else
							{
								return 0;
							}
						});
						
						
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							moveHandle(distances_to_increment[ii].handle, distances_to_increment[ii].new_left);
						}
					}
				}
				
				if(scope.initial_values === false)	//Requires '===' test here. Equality in js is weird: ([0] != false) returns false!
				{}		//Do nothing
				else	//If the user pre-filled their handle values, need to move the handles accordingly.
				{
					if(evt_set_value === '' || evt_set_value === undefined)
					{
						nameInterfaceEvents();	//Make sure the event name is set.
					}
				
					for(ii=0; ii < scope.num_handles; ii++)		//Go through each handle, set it using the normal set function, just like set event listener
					{
						if(scope.use_array === false)
						{
							setHandleValue(ii, scope.initial_values);
						}
						else
						{
							setHandleValue(ii, scope.initial_values[ii]);
						}
					}
				}
				
				//Parse and set up info_html if necessary, now that handles are defined.
				if(scope.info_html !== '' && scope.info_html !== undefined)			//If the info section is user-defined
				{
					scope.info_show = false;				//Hide default info section
					scope.user_info_show = true;		//Show user's info section
					scope.user_info_html = parseInfoHtml(scope.info_html);	//Convert the user's html to actual html for ng-bind-html-unsafe
				}
				
			};		//End setHandles

			
			//setTicks: fills scope.ticks with necessary information. Requires setHandles to have run first.
			var setTicks = function()
			{
				for(var ii = 0; ii < scope.ticks_values.length; ii++)
				{
					if(scope.ticks_values[ii].val === undefined)		//If val is undefined, then the entry itself is the value.
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii], 'name': scope.units_pre + scope.ticks_values[ii] + scope.units_post};
					}
					else if(scope.ticks_values[ii].name === undefined)	//If val defined, name undefined
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii].val, 'name': scope.units_pre + scope.ticks_values[ii].val + scope.units_post};
					}
					else		//Both val and name defined
					{
						scope.ticks[ii] = {'val':scope.ticks_values[ii].val, 'name': scope.ticks_values[ii].name};
					}
					
					//Calculate this tick's left %
					var new_left;
				
					if(user_values_flag === true)
					{
						var index;
						for(var jj = 0; jj < scope.user_values.length; jj++)
						{
							if(scope.user_values[jj].val.toString() == scope.ticks[ii].val.toString())
							{
								index = jj;
								jj = scope.user_values.length;
							}
						}
					
						new_left = increments[index].left;
					}
					else
					{
						new_left = calculate_left(scope.ticks[ii].val);
					}
					
					scope.ticks[ii].left = new_left;
				}
				
			};	//End setTicks
			
			
			var setJquery = function()
			{			
				//initTouch: Function wrapper for timeout - waits until angular applies ids to elements, then sets up jquery touch events
				var initTouch = function()
				{
					if($('#' + scope.slider_id + 'Handle' + 0).length <= 0)
					{
						setTimeout(function()
						{
							scope.$apply(function()
							{
								initTouch();
							});
						}, 500);
					}
					else
					{
						for(ii = 0; ii < scope.num_handles; ii++)
						{
							(function(index)			//wrap in anonymous function to get a local copy of the counter
							{
								var handle_ele = $('#' + scope.slider_id + 'Handle' + index);
								handle_ele.unbind('touchstart');
								handle_ele.bind('touchstart', function()
								{
									scope.$apply(function()
									{
										scope.startHandleDrag(index);
									});
								});
							})(ii);
						}
						
						var slider_ele = $('#' + scope.slider_id);
						slider_ele.unbind('touchmove');
						slider_ele.bind('touchmove', function(event)
						{
							event.preventDefault();							//? Maybe prevents default phone touchmove stuff, like scrolling?
							var touch = event.originalEvent;		//? Apparently Iphones do weird stuff; make sure we have original event.
							scope.$apply(function()
							{
								scope.mousemoveHandler(touch);
							});
						});
					}
				};
				
				initTouch();
			};	//End setJquery
			
			
			//End Setup Functions
			
			//Functions
			
			//*******************************************************************************************
			//calculate_value: takes a handle's left % and returns the corresponding value on the slider
			//	Inverse of calculate_left
			var calculate_value = function(left)
			{
				return fixPrecision((scope.slider_min + ((scope.slider_max - scope.slider_min) * uiPolynomial.evalPoly(scale_function_poly, (left / 100)))), scope.precision);
			};

			
			//*******************************************************************************************
			//invert_value: takes a value on the slider (normalized to the interval [0,1]) and finds the
			//corresponding left decimal as defined by scale_function_poly
			var invert_value = function(value)
			{
				var ret2;
				
				var zero_poly = uiPolynomial.subPoly(scale_function_poly, uiPolynomial.buildPoly([value], [0]));	//The scale polynomial, minus the value in question. This poly has a zero at the x-value we're looking for.
				
				if(scope.zero_method != 'bisection')
				{
					//Try newton's method first. If it fails, fall back on bisection method.
					
					//guess the given value, since this will result in instant success for linear sliders, which are the default.
					var ret1 = uiPolynomial.findPolyZeroNewton({'poly': zero_poly, 'guess': value});
					
					if(ret1.err)
					{
						//Newton's method failed. Try bisection method, which is generally slower but guaranteed to work in our situation.
						ret2 = uiPolynomial.findPolyZeroBisection({'poly': zero_poly, 'a': 0, 'b': 1 });
						return ret2.val;
					}
					else
					{
						return ret1.val;
					}
				}
				else
				{
					//Skip newton's method, go straight to bisection.
					ret2 = uiPolynomial.findPolyZeroBisection({'poly': zero_poly, 'a': 0, 'b': 1 });
					return ret2.val;
				}
			};
			
			//*******************************************************************************************
			//calculate_left: takes a handle's value and returns the corresponding left% on the slider
			//	Inverse of calculate_value
			var calculate_left = function(value)
			{
				return (invert_value((value - scope.slider_min) / (scope.slider_max - scope.slider_min)) * 100);
			};
			
			
			//*******************************************************************************************
			//update_backgrounds: takes the index of a handle in scope.handles and reforms the values of the background divs to the left and right of that handle.
				//Should be called whenever a handle moves.
			var update_backgrounds = function(index)
			{
				//If there is an interior div to the left of the handle, update it
				if(index !== 0)
				{
					scope.interiors[index-1].left = scope.handles[index-1].left;
					scope.interiors[index-1].width = scope.handles[index].left - scope.handles[index-1].left;
				}
				else	//It's the first handle, so update the left background div
				{
					scope.left_bg_width = scope.handles[index].left;
				}
				
				//If there is an interior div to the right of the handle, update it
				if(index < scope.num_handles - 1)
				{
					scope.interiors[index].left = scope.handles[index].left;
					scope.interiors[index].width = scope.handles[index+1].left - scope.handles[index].left;
				}
				else	//It's the last handle, so update the right background div
				{
					scope.right_bg_width = 100 - scope.handles[index].left;
				}
			};
			
			
			//*******************************************************************************************
			//update_zindex: takes the index of a handle in scope.handles and updates its zindex value.
			//Normally the leftmost handle has the higher z-index; however, this causes problems if multiple handles are moved to the far left of the slider.
			//Because handles cannot pass each other, multiple handles stacked on the left would be stuck there; you cannot move the left handle past the other,
			//and you cannot select the right handle because it is below the left handle.
			//To fix this, the zindex values will be inverted for handles very near the slider's left edge. This function handles this check.
			//All handles have a z-index greater than 10, to make sure they're on top of the background divs.
			
			var update_zindex = function(index)
			{
				if(scope.handles[index].left < 2)		//If it's within 2% of the left edge of the slider, invert zindex
				{
					scope.handles[index].zindex = 10 + index + 1;
				}
				else
				{
					scope.handles[index].zindex = 10 + scope.num_handles - index;
				}
			};
			
			
			//*******************************************************************************************
			//fixPrecision: takes a number and an integer. Returns the number with the number of decimal spaces
			//specified by the integer. The integer should be between -20 and 20
			//Ex: fixPrecision(1234, 1) returns 1234.0
			//Ex: fixPrecision(1234, -1) returns 1230
			var fixPrecision = function(number, digits)
			{
				if(digits >= 0)
				{
					return parseFloat(number.toFixed(digits));
				}
				else
				{
					var round_unit = Math.pow(10, (-1 * digits));
					return round_unit * Math.round((number / round_unit));
				}
			};
			
			//*******************************************************************************************
			//initSliderOffsets: handles jquery that gets slider's offset and width.
			//Should be called at the start of every mouse interaction event with the slider
			var initSliderOffsets = function()
			{
				if(scope.slider_moveable === true || slider_init === false)
				{
					slider_offset = $('#' + scope.slider_id + "SliderBar").offset().left;
					slider_width =$('#' + scope.slider_id + "SliderBar").outerWidth();
					slider_init = true;
				}
			};
			
			
			//*******************************************************************************************
			//barClickHandler: click handler for slide bar container. Moves the nearest handle to match the mouse's x-coordinate.
			scope.barClickHandler = function(event)
			{
				//Do nothing unless we aren't dragging a handle
				if(scope.recent_dragging === false)
				{
					initSliderOffsets();	//First must make sure slider offsets set
					
					var x_coord = event.pageX;
					var new_left = convertMouseToSliderPercent(x_coord);
					
					//Check and handle increments
					if(scope.increment !== 0 && scope.increment !== undefined)
					{
						new_left = findNearestIncrement(new_left);
					}
					
					//find the nearest handle
					
					var handle_index = 0;
					//First check if we're to the right of the rightmost handle
					if(scope.handles[scope.num_handles - 1].left <= new_left)
					{
						handle_index = scope.num_handles - 1;
					}
					//next check if we're left of the leftmost handle
					else if(scope.handles[0].left >= new_left)
					{
						handle_index = 0;
					}
					else	//otherwise, find the first handle that isn't to our left
					{
						for(ii = 0; new_left > scope.handles[ii].left; ii++);
						
						//Now the ii-1 handle is left of our position, and the ii handle is to our right
						//Check which is nearer. Tie goes to the right-side handle.
						if((scope.handles[ii].left - new_left) > (new_left - scope.handles[ii-1].left))
						{
							handle_index = ii - 1;
						}
						else
						{
							handle_index = ii;
						}
					}
					
					moveHandle(handle_index, new_left);			//move handle to the new position
					
					if(scope.evt_mouseup !== '' && scope.evt_mouseup !== undefined) //need to fire user's mouseup event
					{
						scope.$emit(scope.evt_mouseup, {'num_handles':scope.num_handles, 'handle':handle_index, 'id':scope.slider_id, 'value': scope.handles[handle_index].return_value});
					}
				}
				
			};
			
			
			//*******************************************************************************************
			//startHandleDrag: mousedown handler for slider handles. Takes a handle's index and starts the mousemove event to drag that handle.
			scope.startHandleDrag = function(index)
			{
				initSliderOffsets();
			
				cur_handle = index;
				dragging = true;
				scope.recent_dragging = true;
				uiSliderService.activate(scope.slider_id);		//Slider's handle is being dragged. Activate this slider in the service.
			};
			
			
			//*******************************************************************************************
			//mousemoveHandler: handler for slider container mousemove event, for dragging handles. Does nothing unless we're dragging a handle.
			scope.mousemoveHandler = function(event)
			{
				if(dragging === true)
				{
					continueHandleDrag(event);
				}
			};
			
			
			//*******************************************************************************************
			var continueHandleDrag = function(event)
			{
				var x_coord;
				
				if(event.touches && event.touches.length)		//If touch event
				{
					x_coord = event.touches[0].pageX;
				}
				else			//If mouse drag event
				{
					x_coord = event.pageX;
				}
				
				var new_left = convertMouseToSliderPercent(x_coord);
				
				//Check and handle increments
				if(scope.increment !== 0 && scope.increment !== undefined)
				{
					new_left = findNearestIncrement(new_left);
				}			
				
				moveHandle(cur_handle, new_left);		//Move the handle
			};
			
			
			//*******************************************************************************************
			//Takes a mouse x coordinate and converts it to a left% on the slider. May return a % that is off the slider.
			var convertMouseToSliderPercent = function(x_coord)
			{
				return ((x_coord - slider_offset) / slider_width) * 100;
			};
			
			
			//*******************************************************************************************
			//moveHandle: Takes a handle index and left% and moves that handle to that position. Takes care of all error checking.
			// -Disallows movement beyond slider edges (stops at edge)
			// -Disallows movement beyond other handles (stops on top of handle)
			// -Does not handle increments. Be sure the left value passed in is a valid increment, if necessary
			// This function is the ONLY way to move a handle, change its value, etc.
			
			var moveHandle = function(handle_index, new_left)
			{				
				//if we've moved beyond the next handle, stop there.
				if((handle_index < (scope.num_handles - 1)) && (new_left > scope.handles[handle_index+1].left))
				{
					new_left = scope.handles[handle_index+1].left;
				}
				//if we've moved beyond the previous handle, stop there.
				else if((handle_index > 0) && (new_left < scope.handles[handle_index-1].left))
				{
					new_left = scope.handles[handle_index-1].left;
				}
				//if we've moved off the slider, stop at the edge.
				else if(new_left < 0)
				{
					new_left = 0;
				}
				else if(new_left > 100)
				{
					new_left = 100;
				}
				
				scope.handles[handle_index].left = new_left;
				scope.handles[handle_index].value = calculate_value(new_left);
				
				if(user_values_flag === false)
				{
					scope.handles[handle_index].display_value = scope.handles[handle_index].value;
					scope.handles[handle_index].return_value = scope.handles[handle_index].value;
				}
				else
				{
					//If values were user-defined, then scope.handles[handle_index].value will be the index of the appropriate user_value
					scope.handles[handle_index].display_value = scope.user_values[scope.handles[handle_index].value].name;
					scope.handles[handle_index].return_value = scope.user_values[scope.handles[handle_index].value].val;
				}
				
				if(scope.handles[handle_index].value_in_handle === true)	//interpolate handle's html with new display_value if necessary
				{
					parseHandleHtml(handle_index);
				}
				
				if(scope.use_array === false) //Arbitrarily treat single handle as special case, to bypass 1-element array.
				{
					scope.handle_values = scope.handles[handle_index].return_value;
				}
				else
				{
					scope.handle_values[handle_index] = scope.handles[handle_index].return_value;
				}
				
				update_backgrounds(handle_index);
				update_zindex(handle_index);
				if(scope.user_info_show === true)		//If the user defined an info section
				{
					scope.user_info_html = parseInfoHtml(scope.info_html);	//Update it
				}
			};
			
			
			//*******************************************************************************************
			//endHandleDrag: mouseup handler for everything. Stops the mousemove event on the container, ending the handle drag.
			var endHandleDrag = function()
			{
				var endHandleDragHelper = function()
				{
					if(dragging === true)
					{
						dragging = false;
						uiSliderService.deactivate();		//Dragging finished. Deactivate in the service
					
						if(scope.evt_mouseup !== '' && scope.evt_mouseup !== undefined) //if we were dragging a handle, then we need to fire the user's mouseup event, if it exists
						{
							scope.$emit(scope.evt_mouseup, {'num_handles':scope.num_handles, 'handle':cur_handle, 'id':scope.slider_id, 'value': scope.handles[cur_handle].return_value});
						}
											
						//Want to disable moving the handle by clicking when dragging and for a short while after dragging
						setTimeout(function()
						{
							scope.$apply(function()
							{
								scope.recent_dragging = false;		//After dragging is finished, wait a while before re-allowing clicking to move handles
							});
						}, 300);
					}
				};
				
				if(scope.$$phase === undefined)
				{
					scope.$apply(function()
					{
						endHandleDragHelper();
					});
				}
				else
				{
					endHandleDragHelper();
				}
			};
			
			//*******************************************************************************************
			//findNearestIncrement: For increment sliders, takes a left value (a position on the slider) and finds
			//	the increment on the slider closest to that value. Returns the left value of that increment.
			var findNearestIncrement = function(left)
			{
			
			// Version 1: Takes advantage of the fact that increments are evenly spaced to calculate where the nearest increment is.
			
			//Must check edge cases to avoid possible errors.
			if(left >= 100)
			{	return 100;	}
			if(left <= 0)
			{	return 0; }
			
			var increment_left = increments[1].left;			//Get left % value of an increment.
			var low_index = Math.floor(left / increment_left);	//Calculate index of increment just below our left value.
			
			//Find the closest entry to our left value. Round up in event of tie.
			if((left - increments[low_index].left) < (increments[low_index+1].left - left))
			{
				return increments[low_index].left;
			}
			else
			{
				return increments[low_index+1].left;
			}
			
			
			// Version 2: does not assume increments are evenly spaced
			/*
				var len = increments.length;
				var index = Math.floor(len / 2);
				var high_index = len - 1;
				var low_index = 0;
				var diff = high_index - low_index;
				
				//Continually cut the array in half, narrowing the range in which to search for our left value.
				//Do this until the array is small.
				while(diff > 4)		//4 is an arbitrary low positive integer
				{
					index = Math.floor(diff / 2) + low_index;
					if(increments[index].left > left)
					{
						high_index = index;
					}
					else
					{
						low_index = index;
					}
					diff = high_index - low_index;
				}
				
				//Now that the array is small, just go through it entry by entry.
				for(var ii = low_index+1; increments[ii].left < left; ii++);	//Find the first entry larger than our left value
				
				//Find the closest entry to our left value. Round up in event of tie.
				if((left - increments[ii-1].left) < (increments[ii].left - left))
				{
					return increments[ii-1].left;
				}
				else
				{
					return increments[ii].left;
				}
			*/
			
			};
			
			
			//*******************************************************************************************
			//parseInfoHtml: takes an html string containing '$$valueN' keys and replaces them with the appropriate handle value,
			//along with the appropriate units strings.
			//Returns the resulting string.
			var parseInfoHtml = function(info_html)
			{
				for(ii = 0; ii < scope.num_handles; ii++)
				{
					info_html = info_html.replace('$$value' + ii, scope.units_pre + scope.handles[ii].display_value) + scope.units_post;
				}
				return info_html;
			};
			
			
			//*******************************************************************************************
			//parseHandleHtml: takes a handle index. Operates on the handle's html_string, replacing
			//	'$$value' keys with the handle's display_value. Places the resulting string in the handle's
			//	innerhtml field
			var parseHandleHtml = function(index)
			{
				scope.handles[index].innerhtml = scope.handles[index].html_string.replace('$$value', scope.units_pre + scope.handles[index].display_value +  scope.units_post);
			};
			
			
			//*******************************************************************************************
			//setHandleValue: Takes a handle index and a handle return value and does all tasks necessary to move the handle to that value.
			// Used by the SetValue event listener.
			var setHandleValue = function(handle, value)
			{
				var new_left;
				
				if(user_values_flag === true)
				{
					var index;
					for(var ii = 0; ii < scope.user_values.length; ii++)
					{
						if(scope.user_values[ii].val.toString() == value.toString())
						{
							index = ii;
							ii = scope.user_values.length;
						}
					}
				
					new_left = increments[index].left;
				}
				else
				{
					new_left = calculate_left(value);
				}
				
				//Code to check for increments.
				//Currently commented out in order to allow the user to manually place a handle at a non-increment position.
//				if(scope.increment != 0)
//				{
//					new_left = findNearestIncrement(new_left);
//				}		
				
				moveHandle(handle, new_left);
			};

			//*******************************************************************************************
			//nameInterfaceEvents: sets the names for the events. Should be called whenever scope.slider_id changes.
			var nameInterfaceEvents = function()
			{
				evt_get_value = 'evtSliderGetValue' + scope.slider_id;								//This is the event you must broadcast to read a value from this slider.
				evt_return_value = 'evtSliderReturnValue' + scope.slider_id;					//The event you must listen for to read a value from this slider.
				evt_get_all_values = 'evtSliderGetAllValues' + scope.slider_id;				//This is the event you must broadcast to read all values from this slider.
				evt_return_all_values = 'evtSliderReturnAllValues' + scope.slider_id;	//The event you must listen for to read all values from this slider.
				evt_set_value = 'evtSliderSetValue' + scope.slider_id;								//This is the event you must broadcast to set a value on the slider
				evt_init_slider = 'evtInitSlider' + scope.slider_id;									//This is the event you must broadcast to re-initialize the slider.
			};
			
			//End Functions

			
			//Set up jquery
			//Use document.ready, not scope.$on('viewContentLoaded'), because apparently viewContentLoaded doesn't always fire.
			$(document).ready(function()
			{
				setJquery();
			});
			
			
			//Set up Interface
			
			//Get a value
			scope.$on(evt_get_value, function(evt, params)
			{
				//params
					//handle				//Index of the handle whose value should be returned. Handles are zero-indexed and arranged in ascending order from left to right.
				//Note: if params.handle isn't defined, the first handle's value will be returned.
				var handle = 0;
				if(params !== undefined && params.handle !== undefined)
				{
					handle = params.handle;
				}
				
				scope.$emit(evt_return_value, {'value': scope.handles[handle].return_value});
			});
			
			//Get all values. ALWAYS returns the values in an array. Period.
			scope.$on(evt_get_all_values, function(evt, params)
			{
				var ret_array = [];
				for(ii=0; ii < scope.handles.length; ii++)
				{
					ret_array[ii] = scope.handles[ii].return_value;
				}
				scope.$emit(evt_return_all_values, {'values': ret_array});
			});
			
			//Set a value
			scope.$on(evt_set_value, function(evt, params)
			{
				//params
					//handle				//Index of handle whose value is to be set. Handles are zero-indexed and arranged in ascending order from left to right.
					//value					//Value on the slider to give the handle. Must be a valid value.
				//Note: if params.handle isn't defined, the first handle's value will be set.
				
				var handle = 0;
				if(params !== undefined && params.handle !== undefined)
				{
					handle = params.handle;
				}
				setHandleValue(handle, params.value);
			});
			
			//Init the slider
			scope.$on(evt_init_slider, function(evt, params)
			{
				//Don't try to re-build the slider while it's being built.
				if(building_slider === true)
				{
					building_queued = true;
				}
				else
				{
					initSlider();
				}
			});
			
			
			initSlider();	//Init the slider
			
			//Have to re-init if the id changes
			attrs.$observe('sliderId', function(value)
			{
				initSlider();
			});
			
			//Array checker. Returns true if the argument is a scalar array []. False otherwise.
			var isArray = function(array1)
			{
				if(Object.prototype.toString.apply(array1) === "[object Array]")
				{
					return true;
				}
				else
				{
					return false;
				}
			};
			
		}	//End: link function
	};
}])
.factory('uiSliderService', [function()
{
	
//uiSliderService: The sole purpose of this service is to handle the slider's mouseup event.
//When there are multiple sliders on a page, the mouseup event to end handle dragging for every single one would fire with every single mouseup. This is bad for performance.
//This service eliminates this inefficiency; now there is a single mouseup event for all sliders, defined in this service.
//The service calls the appropriate slider's mouseup handler to end dragging.

//Possible issue warning: As of 4/11/2013, there is no code to determine when a slider should be deregistered with the service.
//In theory, this could lead to memory overflow and/or reduced performance.
//In practice, this is unlikely to cause problems. The user would have to view hundreds if not thousands of sliders, each with a unique id,
//in a single app session without ever refreshing the page.

	var inst =
	{
		//list of all registered sliders. Key is the slider's id. Value is the mouseup callback endHandleDrag
		sliders: {},
		
		//Id of the currently active slider. If no slider is active, this property is the boolean 'false'.
		active: false,
		
		//Method to add a slider to the list
		register: function(id, callback)
		{
			this.sliders[id] = callback;
		},
		
		//Method to remove a slider from the list
		remove: function(id)
		{
			delete this.sliders[id];
		},
		
		//Method to activate a slider
		activate: function(id)
		{
			this.active = id;
		},
		
		//Method to deactivate a slider
		deactivate: function()
		{
			this.active = false;
		},
		
		clickHandler: function(thisObj)
		{	
			if(thisObj.active === false)		//Do nothing unless active
			{}
			else
			{
				thisObj.sliders[thisObj.active]();	//Call the active slider's registered callback function.
			}
		},
		
		//Initialization function. Sets event listeners on body element.
		init: function()
		{
			var thisObj = this;
			
			//Set mouseup function to end dragging
			$('body').bind('mouseup', function(event)
			{
				thisObj.clickHandler(thisObj, event);
			});
			
			//Set touch events for phones		
			$('body').bind('touchend', function(event)
			{
				thisObj.clickHandler(thisObj, event);
			});
		}
		
	};

	inst.init();
	return inst;
}])
.factory('uiPolynomial', [function()
{
	//Polynomial Function Library
	//A polynomial is an array [] of arrays {}. Each inner array corresponds to a term:
		//poly
			//poly[ii]
				//coeff				//Coefficent for this term. May be any real number.
				//exp					//Exponent for this term. May be any real number.

	//Note that a polynomial's terms need not be in any particular order, and there may be
	//multiple terms with identical exponents.
	//Use combinePolyTerms to combine like exponents and also to sort them in ascending order.
	//addPoly and subPoly do this automatically.

	//Index:
		//1. buildPoly
		//2. stringToPoly
		//3. evalPoly
		//4. polyToFunction
		//5. differentiatePoly
		//6. integratePoly
		//7. combinePolyTerms
		//8. scalePoly
		//9. addPoly
		//10. subPoly
		//11. findPolyZeroNewton
		//12. findPolyZeroBisection

	var inst ={

		//*******************************************************************************************
		//1. buildPoly: takes an array of coefficients and an array of corresponding exponents, of equal length
		//Returns the corresponding polynomial
		//*******************************************************************************************
		buildPoly : function(coeffs, exps)
		{
			var poly = [];
			var ii;
			for(ii = 0; ii < coeffs.length; ii++)
			{
				poly[ii] = {'coeff':coeffs[ii], 'exp':exps[ii]};
			}
			return poly;
		},

		
		
		//*******************************************************************************************
		//2. stringToPoly: takes a string with the format '[coefficient, exponent]~[coefficient, exponent]~...'
		//Returns the corresponding polynomial
		//*******************************************************************************************
		stringToPoly : function(poly_string)
		{
			var terms = poly_string.split('~');
			var ii;
			var poly = [];
			
			for(ii = 0; ii < terms.length; ii++)
			{
				poly[ii] = {};
				poly[ii].coeff = parseFloat((terms[ii].slice(terms[ii].indexOf('[')+1)), (terms[ii].slice(terms[ii].indexOf(',')-1)));
				poly[ii].exp = parseFloat((terms[ii].slice(terms[ii].indexOf(',')+1)), (terms[ii].slice(terms[ii].indexOf(']')-1)));
			}
			return poly;
		},
		
		
		
		//*******************************************************************************************
		//3. evalPoly: takes a polynomial and a number. Returns value of poly at that number.
		//Returns the corresponding polynomial
		//*******************************************************************************************
		evalPoly : function(poly, xx)
		{
			var val = 0;
			var ii;
			for(ii = 0; ii < poly.length; ii++)
			{
				val += (poly[ii].coeff * Math.pow(xx, poly[ii].exp));
			}
			return val;
		},

		
		
		//*******************************************************************************************
		//4. polyToFunction: takes a polynomial. Returns the polynomial as a function f(x), for convenience.
		//*******************************************************************************************
		polyToFunction : function(poly)
		{
			var thisObj = this;
			return function(xx) {
				return thisObj.evalPoly(poly, xx);
			};
		},
		
		
		
		//*******************************************************************************************
		//5. differentiatePoly: takes a polynomial. Returns the polynomial's derivative (another polynomial)
		//*******************************************************************************************
		differentiatePoly : function(poly)
		{
			var thisObj = this;
			var deriv = thisObj.copyPoly(poly);
			var ii;
			for(ii = 0; ii < deriv.length; ii++)
			{
				if(deriv[ii].exp === 0)
				{
					deriv[ii].coeff = 0;		//Derivative of constant term is 0; leave exp at 0
				}
				else
				{
					deriv[ii].coeff = deriv[ii].coeff * deriv[ii].exp;		//Power rule.
					deriv[ii].exp = deriv[ii].exp - 1;
				}
			}
			return deriv;
		},
		
		
		
		//*******************************************************************************************
		//6. integratePoly: takes a polynomial. Returns the polynomial's integral (another polynomial).
		//Integral will assume constant term is zero.
		//Can't integrate polys with an x^(-1) term, since our polynomial data type does not support
		//logarithm terms. Will console.log an error message and return the given polynomial in this case.
		//*******************************************************************************************
		integratePoly : function(poly)
		{
			var integral = thisObj.copyPoly(poly);
			var ii;
			for(ii = 0; ii < integral.length; ii++)
			{
				if(integral[ii].exp == -1)			//Abort
				{
					console.log("ERROR: uiPolynomial.integratePoly can't handle polynomials with an exponent = -1 term!");
					return poly;
				}
				else
				{
					integral[ii].exp = integral[ii].exp + 1;
					integral[ii].coeff = integral[ii].coeff / integral[ii].exp;		//Power rule.
				}
			}
			return integral;
		},
							
		//*******************************************************************************************
		//7. combinePolyTerms: takes a polynomial. Returns the polynomial with like terms combined.
		//Removes terms with coeff == 0. Also sorts poly terms in ascending order.
		//*******************************************************************************************
		combinePolyTerms : function(poly)
		{
			var ii;
			var new_poly = [];
			var term_counter = 0;
			var cur_exp;
			
			//Sort the terms in ascending order by exponent
			poly = poly.sort(function(a, b)
			{
				if(a.exp < b.exp)
				{
					return -1;
				}
				else if(a.exp > b.exp)
				{
					return 1;
				}
				else
				{
					return 0;
				}
			});
			
			cur_exp = poly[0].exp;
			new_poly[term_counter] = {'coeff': 0, 'exp':cur_exp};
			for(ii = 0; ii < poly.length; ii++)
			{
				if(cur_exp == poly[ii].exp)
				{
					new_poly[term_counter].coeff = new_poly[term_counter].coeff + poly[ii].coeff;		//Combine coefficients
				}
				else
				{
					term_counter++;
					cur_exp = poly[ii].exp;
					new_poly[term_counter] = {'coeff': poly[ii].coeff, 'exp':cur_exp};
				}
			}
			return new_poly;				
		},

		//*******************************************************************************************
		//8. scalePoly: takes a polynomial and a scalar. Scales the polynomial by the scalar. Returns resulting polynomial.
		//*******************************************************************************************
		scalePoly : function(poly, scalar)
		{
			var thisObj = this;
			var new_poly = thisObj.copyPoly(poly);
			var ii;
			for(ii=0; ii < new_poly.length; ii++)
			{
				new_poly[ii].coeff = new_poly[ii].coeff * scalar;
			}
			
			return new_poly;
		},
							
		//*******************************************************************************************
		//9. addPoly: takes two polynomials and adds thems together. Returns resulting polynomial.
		//*******************************************************************************************
		addPoly : function(poly1, poly2)
		{
			return this.combinePolyTerms(poly1.concat(poly2));
		},
							
		//*******************************************************************************************
		//10. subPoly: takes two polynomials and subtracts second from first. Returns resulting polynomial.
		//*******************************************************************************************
		subPoly : function(poly1, poly2)
		{
			return this.addPoly(poly1, this.scalePoly(poly2, -1));
		},
							
		//*******************************************************************************************
		//11. findPolyZeroNewton: Takes a polynomial and a guess (a number that might be the zero).
		//Uses Newton's method to find a zero of the polynomial. Returns the zero.
		//Make sure the function actually has a zero before using Newton's method!!!
		//*******************************************************************************************
		findPolyZeroNewton : function(params)
		{
			//params
				//poly						//The polynomial to find a zero for (required)
				//guess						//Real number. Initial guess as to where the zero is (required)
				//epsilon					//Positive real number. Accuracy threshold.  Optional.
				//max_iterations	//Positive integer. If we go beyond this many iterations with no answer found, returns an error.  Optional.
				
			var thisObj = this;
			
			if(params === undefined || params.poly === undefined || params.guess === undefined)
			{
				console.log("Error in uiPolynomial.findPolyZeroNewton: params.poly and params.guess must be defined");
				return {'err':true, 'val':0};	//Return error and a dummy value
			}
			else
			{
				var poly = params.poly;
				var guess = params.guess;
				
				var epsilon = 0.00001;					//Accuracy threshold. Tells algorithm how close to get to the real answer
				if(params.epsilon !== undefined)
				{
					epsilon = params.epsilon;
				}
				var max_iterations = 50;
				if(params.max_iterations !== undefined)
				{
					max_iterations = params.max_iterations;
				}
				
				//If the guess is the answer we're looking for
				if(Math.abs(thisObj.evalPoly(poly, guess)) < epsilon)
				{
					return {'err':false, 'val':guess};
				}
				//Else apply newton's method
				else
				{
					var ff = thisObj.polyToFunction(poly);
					var f_prime = thisObj.polyToFunction(thisObj.differentiatePoly(poly));
					var iterations = 0;
					
					var iterator = function(xx)
					{
						if(Math.abs(ff(xx)) < epsilon)
						{
							return {'err':false, 'val':xx};
						}
						else
						{
							iterations++;
							if(iterations > max_iterations)
							{
								console.log("Error in uiPolynomial.findPolyZeroNewton: Too many iterations without finding answer");
								return {'err':true, 'val':xx};		//Return error and the current value.
							}
							else
							{
								if(f_prime(xx) === 0)			//Error. Newton's method fails in this case,
								{
									return iterator(xx + 0.1);	//So try again with a slightly different guess.
								}
								else
								{
									return iterator(xx - (ff(xx) / f_prime(xx)));		//Continue with Newton's method
								}
							}
						}
					};
					
					return iterator(guess - (ff(guess) / f_prime(guess)));
				}
			}
		},
		
		//*******************************************************************************************
		//12. findPolyZeroBisection: Takes a polynomial and an interval. Finds the polynomial's zero in
		//	the interval. The polynomial should have exactly one zero in the interval, be defined
		//	throughout the interval, and must have opposite signs at the endpoints.
		//	This method is generally slower than Newton's method, but guaranteed to work for
		//	continuous functions. Therefore, since polynomials are continuous, it will always work.
		//*******************************************************************************************
		findPolyZeroBisection : function(params)
		{
			//params
				//poly						//The polynomial to find a zero for. Must be defined on [a, b], and must be >= 0 at one endpoint and <= 0 at the other.
				//a								//Real number. Lower bound for the interval in which to search for a zero.
				//b								//Real number larger than a. Upper bound for the interval in which to search for a zero.
				//epsilon					//Positive real number. Accuracy threshold.  Optional.
				
			var thisObj = this;
			
			if(params === undefined || params.poly === undefined || params.a === undefined || params.b === undefined)
			{
				console.log("Error in uiPolynomial.findPolyZeroBisection: params.poly, params.a, and params.b must be defined");
				return {'err':true, 'val':0};	//Return error and a dummy value
			}
			else
			{
				var poly = params.poly;
				
				var epsilon = 0.0001;					//Accuracy threshold. Tells algorithm how close to get to the real answer
				if(params.epsilon !== undefined)
				{
					epsilon = params.epsilon;
				}
				//var max_iterations = 100;
				//if(params.max_iterations != undefined)
				//{
				//	max_iterations = params.max_iterations;
				//}
				
				var ff = thisObj.polyToFunction(poly);
				//var iterations = 0;
					
				var iterator = function(a, b)
				{
					var f_a = ff(a);
					var f_b = ff(b);
					//If a is the answer
					if(Math.abs(f_a) < epsilon)
					{
						return {'err':false, 'val':a};
					}
					//Else if b is the answer
					else if(Math.abs(f_b) < epsilon)
					{
						return {'err':false, 'val':b};
					}
					//Else if there is no answer
					else if((f_a > 0 && f_b > 0) || (f_a < 0 && f_b < 0))
					{
						//Error.
						console.log("Error in uiPolynomial.findPolyZeroBisection: Bad interval. The polynomial must be >= 0 at one endpoint and <= 0 at the other.");
						return {'err':true, 'val':0};	//Return error and dummy value.
					}
					else
					{
						var c = ((a + b) / 2);		//Midpoint of interval
						var f_c = ff(c);
						
						//If the midpoint is the answer
						if(Math.abs(f_c) < epsilon)
						{
							return {'err':false, 'val':c};
						}
						//Else keep going
						else
						{
							//iterations++;
							//if(iterations > max_iterations)
							//{
							//	console.log("Error in uiPolynomial.findPolyZeroBisection: Too many iterations without finding answer");
							//	callback(true, c);		//Return error and the current midpoint.
							//}
							//else
							//{
							
							//Determine which interval has the zero: [a, c] or [c, b]. Only one can.
							if(f_c < 0)
							{
								if(f_a > 0)
								{
									return iterator(a, c);
								}
								else
								{
									return iterator(c, b);
								}
							}
							else
							{
								if(f_a < 0)
								{
									return iterator(a, c);
								}
								else
								{
									return iterator(c, b);
								}
							}
							
							//}
						}
					}
				};
					
				return iterator(params.a, params.b);
			}
		},
		
		//*******************************************************************************************
		//13. copyPoly: Takes a polynomial and returns an exact copy of that polynomial.
		//Could be replaced by a deep array copier/cloner.
		//*******************************************************************************************
		copyPoly : function(poly)
		{
			var copy = [];
			var ii;
			for(ii = 0; ii < poly.length; ii++)
			{
				copy[ii] =
				{
					'coeff': poly[ii].coeff,
					'exp': poly[ii].exp
				};
			}
			return copy;
		}
		
	};
	return inst;
}]);