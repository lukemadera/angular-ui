/**
@todo
- add specific input type directives to be included here (checkbox, etc.)
- do wide form style (with label to the left of it) [then remove lFormInput directive & form.css & l-form.css, any other remaining form/input builder stuff?)
- add validation

SUPPORTED INPUT TYPES:
text, textarea, select, multiSelect
NOT YET SUPPORTED INPUT TYPES:
checkbox, multiCheckbox, slider, image?

@toc

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {String} ngModel Variable for storing the input's value
	@param {Object} opts
	@param {Array} [selectOpts] REQUIRED for 'select' type - options; each item is an object of:
		@param {String} val Value of this option
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
$scope.opts ={}

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiForminput', ['ui.config', '$compile', '$http', function (uiConfig, $compile, $http) {
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

		compile: function(element, attrs, transclude) {
			if(!attrs.type) {
				attrs.type ='text';		//default
			}
			if(attrs.id ===undefined) {
				attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);
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
				input: ''
			};
			if(label && !attrs.noLabel) {
				html.label ="<label>"+label+"</label>";
			}
			
			//copy over attributes
			var customAttrs ='';		//string of attrs to copy over to input
			var skipAttrs =['uiForminput', 'ngModel', 'label', 'type', 'placeholder', 'opts'];
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
				html.input ="<input ng-model='ngModel' type='text' placeholder='"+placeholder+"' "+customAttrs+" />";
			}
			else if(attrs.type =='textarea') {
				html.input ="<textarea ng-model='ngModel' placeholder='"+placeholder+"' "+customAttrs+" ></textarea>";
			}
			else if(attrs.type =='select') {
				html.input ="<select ng-model='ngModel' "+customAttrs+" ng-options='opt.val as opt.name for opt in selectOpts'></select>";
			}
			else if(attrs.type =='multi-select') {
				html.input ="<div ui-multiselect id='"+attrs.id+"' select-opts='selectOpts' ng-model='ngModel' config='opts'></div>";
			}
			
			var htmlFull ="<div>"+html.label+html.input+"</div>";
			element.replaceWith(htmlFull);
			
			return function(scope, element, attrs) {
				if(attrs.type =='multi-select') {
					$compile($(element))(scope);
				}
			};
		},
		controller: function($scope, $element, $attrs) {
		}
	};
}])
;