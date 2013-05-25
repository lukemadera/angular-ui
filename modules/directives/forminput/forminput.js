/**
@todo
- add specific input type directives to be included here (checkbox, etc.)
- add more/customized validation

Adds consistent layout (inluding input labels) and styling to an input element so groups of inputs all look the same. Also adds validation. Basically makes it faster and easier to build forms by making it just 1 line of directive code in your partial (rather than several) to create a full, nice looking input.
This directive is typically NOT meant to be used with just one input by itself or for a group of inputs that do NOT have a lot in common - since the whole point of this directive is to make a GROUP of inputs look the same.

SUPPORTED INPUT TYPES:
text, password, textarea, select, multiSelect
NOT YET SUPPORTED INPUT TYPES:
checkbox, multiCheckbox, slider, image?

@toc
1. init
2. initSelect
3. initSelectModel
4. initSelectOpts
5. $scope.$watch('ngModel',..

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {String} ngModel Variable for storing the input's value
	@param {Object} opts
		@param {Function} [ngChange] Will be called AFTER the value is updated
		@param {Object} [validationMessages] Key-value pairs of validation messages to display (i.e. {minlength: 'Too short!'} )
	@param {Array} [selectOpts] REQUIRED for 'select' type. These are options for the <select>. Each item is an object of:
		@param {String} val Value of this option. NOTE: this should be a STRING, not a number or int type variable. Values will be coerced to 'string' here but for performance and to ensure accurate display, pass these in as strings (i.e. 1 would become '1'). UPDATE: they may not actually have to be strings but this type coercion ensures the ngModel matches the options since 1 will not match '1' and then the select value won't be set properly. So basically types need to match so just keep everything in strings. Again, ngModel type coercion will be done here but it's best to be safe and just keep everything as strings.
		@param {String} name text/html to display for this option

attrs
	@param {String} [type ='text'] Input type, one of: 'text'
	@param {String} [class =''] Class to give to outermost element
	@param {String} [id ='[random string]'] Id for this input
	@param {String} [placeholder =''] Placeholder text for input (defaults to attrs.label if placeholder is not defined)
	@param {String} [label =''] Text for <label> (defaults to attrs.placeholder if label is not defined)
	@param {Number} [noLabel] Set to 1 to not show label
	

EXAMPLE usage:
partial / html:
<div ui-forminput opts='opts' ng-model='formVals.title'></div>

controller / js:
$scope.formVals ={
	'title':'test title here'
};
$scope.opts ={
	ngChange: function() {$scope.searchTasks({}); }
};

$scope.searchTasks =function() {
	//do something
};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiForminput', ['ui.config', '$compile', '$http', '$timeout', function (uiConfig, $compile, $http, $timeout) {
  return {
		restrict: 'A',
		//NOTE: transclude and terminal don't play nice together and those plus priority are finicky; I don't really understand it, but in order for BOTH the $scope.form.$valid to be accurate AND the ngModel to carry through, need:
		//transclude: true, terminal: false
		transclude: true,	//NOTE: this does NOT work the same with "terminal" set, so after to use "transclude" function instead of ng-transclude..		//NOTE: this apparently is REQUIRED even if not using transclude..
		priority:100,		//we need this AND terminal - otherwise the form will not be $valid on submit (priority 100 so this will happen before ngModel)
		//terminal: true,		//can NOT be set otherwise ngModel value will be blank / not accurrate		//we need this AND priority - otherwise the form will not be $valid on submit
		scope: {
			ngModel:'=',
			// opts:'=?',		//not supported on stable releases of AngularJS yet (as of 2013.04.30)
			opts:'=',
			selectOpts:'='
		},
		require: '?^form',		//if we are in a form then we can access the formController (necessary for validation to work)

		compile: function(element, attrs, transclude) {
			if(!attrs.type) {
				attrs.type ='text';		//default
			}
			
			var defaults ={'noLabel':0};
			for(var xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			var attrsToInt =['noLabel'];
			for(var ii=0; ii<attrsToInt.length; ii++) {
				attrs[attrsToInt[ii]] =parseInt(attrs[attrsToInt[ii]], 10);
			}
			
			var classes =attrs.class || '';
			var placeholder =attrs.placeholder || attrs.label || '';
			var label =attrs.label || attrs.placeholder || '';
			
			//was going to try to put html in templates but since don't have access to scope in compile function, there's no way to set dynamic values, which is the whole point of this directive.. Plus it's better for performance to just have things here, even though it breaks the "separation of html and javascript" convention..
			// $http.get('template/' + template + '.html', {cache:$templateCache}).then(function(response) {
			// });
			var html ={
				label: '',
				input: '',
				validation: ''
			};
			if(label && !attrs.noLabel) {
				html.label ="<label>"+label+"</label>";
			}
			
			//copy over attributes
			var customAttrs ='';		//string of attrs to copy over to input
			var skipAttrs =['uiForminput', 'ngModel', 'label', 'type', 'placeholder', 'opts', 'name'];
			angular.forEach(attrs, function (value, key) {
				if (key.charAt(0) !== '$' && skipAttrs.indexOf(key) === -1) {
					customAttrs+=attrs.$attr[key];
					if(attrs[key]) {
						customAttrs+='='+attrs[key];
					}
					customAttrs+=' ';
				}
			});
			
			if(attrs.type =='text') {
				html.input ="<input class='ui-forminput-input' name='{{name}}' ng-model='ngModel' type='text' placeholder='"+placeholder+"' "+customAttrs+" />";
			}
			else if(attrs.type =='password') {
				html.input ="<input class='ui-forminput-input' name='{{name}}' ng-model='ngModel' type='password' placeholder='"+placeholder+"' "+customAttrs+" />";
			}
			else if(attrs.type =='textarea') {
				html.input ="<textarea class='ui-forminput-input' name='{{name}}' ng-model='ngModel' placeholder='"+placeholder+"' "+customAttrs+" ></textarea>";
			}
			else if(attrs.type =='select') {
				html.input ="<select class='ui-forminput-input' name='{{name}}' ng-model='ngModel' ng-change='onchange({})' "+customAttrs+" ng-options='opt.val as opt.name for opt in selectOpts'></select>";
			}
			else if(attrs.type =='multi-select') {
				html.input ="<div class='ui-forminput-input' name='{{name}}' ui-multiselect select-opts='selectOpts' ng-model='ngModel' config='opts'></div>";
			}
			
			//validation
			html.validation ="<div class='ui-forminput-validation text-error' ng-repeat='(key, error) in field.$error' ng-show='error && field.$dirty' class='help-inline'>{{opts1.validationMessages[key]}}</div>";
			
			var htmlFull ="<div class='ui-forminput-cont'><div class='ui-forminput'>"+html.label+html.input+"</div>"+html.validation+"</div>";
			element.replaceWith(htmlFull);
			
			return function(scope, element, attrs, formCtrl) {
			
				//if was in an ng-repeat, they'll have have the same compile function so have to set the id here, NOT in the compile function (otherwise they'd all be the same..)
				if(attrs.id ===undefined) {
					attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);
				}
				if(!attrs.name) {
					attrs.name =attrs.id;
				}
				scope.id =attrs.id;
				scope.name =attrs.name;
				
				/*
				//NOT WORKING..
				//if was in an ng-repeat, they'll all have the same id's so need to re-write the html with new unique id's..
				if(scope.$parent.$index !=undefined) {		//ng-repeat has $parent.$index so use this to test
					var oldId =attrs.id;		//save for replacing later
					attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);		//overwrite with new one (link function is run per each item so this will generate new id's for EACH instance, which is what we want to ensure uniqueness)
					
					var newHtml =element.html().replace(new RegExp(oldId,"gm"), attrs.id);
					element.html(newHtml);
					$compile($(element))(scope);
				}
				*/
				
				if(attrs.type =='multi-select') {
					$compile($(element))(scope);
				}
				if(formCtrl) {
					scope.field =formCtrl[attrs.name];
				}
			};
		},
		controller: function($scope, $element, $attrs) {
			$scope.opts1 ={};		//can't use $scope.opts in case it's not defined/set otherwise get "Non-assignable model expression.." error..
			var defaultOpts ={
				validationMessages: {
					required: 'Required!',
					minlength: 'Too short!',
					maxlength: 'Too long!',
					pattern: 'Invalid characters!'
					// number: 'Must be a number!'		//not working
				}
			};
			if(!$scope.opts || $scope.opts ===undefined) {
				$scope.opts1 =defaultOpts;
			}
			else {		//extend defaults
				var xx;
				for(xx in defaultOpts) {
					$scope.opts1[xx] =defaultOpts[xx];
				}
			}
			
			
			if($scope.opts && $scope.opts.ngChange) {
				$scope.onchange =function(params) {
					//timeout first so the value is updated BEFORE change fires
					$timeout(function() {
						$scope.opts.ngChange();
					}, 50);
				};
			}
			
			
			/**
			@toc 1.
			@method init
			*/
			function init(params) {
				if($attrs.type =='select' || $attrs.type =='multiSelect') {
					initSelect({});
				}
			}
			
			/**
			<select> opts must be STRINGS otherwise they won't work properly (number values will just have 0, 1, 2, etc. as values). UPDATE: this may not actually be true - inspecting the HTML will always show "value='0'" "value='1'" for the select option values but they should still work properly. What IS important is that types match between the option values and the ngModel. Thus we're not type forcing ngModel to be a string to ensure they both match.
			@toc 2.
			@method initSelect
			*/
			function initSelect(params) {
				initSelectModel({});
				initSelectOpts({});
			}
			
			/**
			@toc 3.
			@method initSelectModel
			*/
			function initSelectModel(params) {
				if($scope.ngModel !==undefined && typeof($scope.ngModel) !=='string') {		//NOTE: MUST first check that ngModel is not undefined since otherwise converting to string will cause errors later
					$scope.ngModel =$scope.ngModel.toString();		//ensure BOTH ngModel and options are both strings
				}
			}
			
			/**
			@toc 4.
			@method initSelectOpts
			*/
			function initSelectOpts(params) {
				var ii;
				for(ii =0; ii<$scope.selectOpts.length; ii++) {
					if(typeof($scope.selectOpts[ii].val) =='number') {
						$scope.selectOpts[ii].val =$scope.selectOpts[ii].val.toString();
					}
					else {		//assume they're all the same format so if find one non-number, break (for performance reasons)
						break;
					}
				}
			}
			
			/**
			@toc 5.
			*/
			$scope.$watch('ngModel', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					//if ngModel changes, have to ensure it's a string - otherwise the currently selected value will NOT be selected (it will just show the blank top option as selected)
					if($attrs.type =='select' || $attrs.type =='multiSelect') {
						initSelectModel({});
					}
				}
			});
			
			init({});		//init the first time
		}
	};
}])
;