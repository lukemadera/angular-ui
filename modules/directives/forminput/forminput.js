/**
@todo
- do wide form style (with label to the left of it) [then remove lFormInput directive & form.css & l-form.css, any other remaining form/input builder stuff?)
- add validation
- add specific input type directives to be included here (checkbox, select, multi-select, etc.)

NICE TO HAVE (not need to have)
- would be nice to be able to support transcluded custom inputs (put within the proper input section so still get label and layout to match rest of form) BUT this seems too difficult / not possible without scope:true otherwise ngModel and other scope values are isolated and don't work. Even without that, wouldn't be able to handle validation properly with custom inputs. So maybe this is trying to do too much and we just need to build then link to other directives for each common input type so no custom types are needed (or if they are, they'll just have to manually match the styles/layout of the rest)

@toc

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {String} ngModel Variable for storing the input's value
	@param {Object} opts

attrs
	@param {String} [type ='text'] Input type, one of: 'text'
	@param {String} [class =''] Class to give to outermost element
	@param {String} [id ='[random string]'] Id for this input
	@param {String} [placeholder =''] Placeholder text for input (defaults to attrs.label if placeholder is not defined)
	@param {String} [label =''] Text for <label> (defaults to attrs.placeholder if label is not defined)
	

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
			// opts:'=?'		//not supported on stable releases yet (as of 2013.04.30)
			opts:'='
		},

		compile: function(element, attrs, transclude) {
			if(!attrs.type) {
				attrs.type ='text';		//default
			}
			// if(attrs.id ===undefined) {
				// attrs.id ="uiFormInput"+attrs.type+Math.random().toString(36).substring(7);
			// }
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
			if(label) {
				html.label ="<label>"+label+"</label>";
			}
			
			//copy over attributes
			var customAttrs ='';		//string of attrs to copy over to input
			var skipAttrs =['uiForminput', 'ngModel', 'label', 'type', 'placeholder', 'opts'];
			angular.forEach(attrs, function (value, key) {
				if (key.charAt(0) !== '$' && skipAttrs.indexOf(key) === -1) {
					// inputEl.attr(snake_case(key, '-'), value);
					// input[key] = value;
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
			else if(attrs.type =='transclude') {
				//html.input ="<div ng-transclude></div>";		//doesn't work here with "terminal" set to true..
			}
			
			var htmlFull ="<div>"+html.label+html.input+"</div>";
			element.replaceWith(htmlFull);
			
			return function(scope, element, attrs) {
				//do the transclude here since ng-transclude doesn't seem to work with 'terminal' set to true
				if(attrs.type =='transclude') {
					transclude(scope, function (clone) {
						element.append(clone);
					});
				}
			};
		},
		controller: function($scope, $element, $attrs) {
		}
	};
}])
;