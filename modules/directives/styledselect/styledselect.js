/**
This directive makes a <select> element customizably stylable by making the <select> element opacity 0 and position absolute and then putting the custom styled element behind it and copying the selected value (option) from the actual/functional <select> to the display version of the select.

//TOC
//1. init

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
	@param {Array} opts
	@param {String} ngModel

attrs
	@param {String} [placeholder='Select']


EXAMPLE usage:
partial / html:
	<select ui-styledselect opts='opts' ng-model='ngModel'></select>

controller / js:

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiStyledselect', ['ui.config', '$compile', '$timeout', function (uiConfig, $compile, $timeout) {
  return {
		//priority:500,
		restrict: 'A',
		scope: {
			opts: '=',
			ngModel: '='
		},

		compile: function(element, attrs) {
			var defaults ={'placeholder':'Select'};
			for(var xx in defaults) {
				if(attrs[xx] ==undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			
			var html="<div class='ui-styledselect-div'>"+		//note - MUST have a wrapper div since the outermost element that is the element itself will NOT work properly; only content INSIDE it will..
			"<select class='ui-styledselect' ng-change='updateVal({})' ng-options='opt.val as opt.name for opt in opts' ng-model='ngModel'>"+
				"<option value=''>"+attrs.placeholder+"</option>"+
			"</select>"+
			"<div class='ui-styledselect-display'>"+
				"{{displayVal}}"+
				"<div class='ui-styledselect-display-icon'></div>"+
				//"displayVal: {{displayVal}}"+		//TESTING
				//"ngModel: {{ngModel}}"+		//TESTING
			"</div>"+
			"</div>";
			element.replaceWith(html);
			
			return function(scope, element, attrs) {
				var dummy =1;
				//$compile(element)(scope);		//so ng-options works		//UPDATE: this now results in double options so CAN'T use it.. (and it seems to work without it now..)
			};
		},
		
		controller: function($scope, $element, $attrs) {
			if(!$scope.ngModel) {
				$scope.displayVal =$attrs.placeholder;
			}
			else {
				$scope.displayVal =$scope.ngModel;
			}
			/*
			//not currently working? or needed (just use $watch ngModel instead?)
			$scope.updateVal =function(params) {
				alert(ngModel);
				var dummy =1;
			};
			*/
			
			$scope.$watch('ngModel', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					//update display value - set it to the name of the opt whose value matches ngModel (newVal)
					for(var ii=0; ii<$scope.opts.length; ii++) {
						if($scope.opts[ii].val ==newVal) {
							$scope.displayVal =$scope.opts[ii].name;
							break;
						}
					}
				}
			});
		}
	};
}]);