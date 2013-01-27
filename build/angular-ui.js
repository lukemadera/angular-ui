/**
 * AngularUI - The companion suite for AngularJS
 * @version v0.3.2 - 2013-01-26
 * @link http://angular-ui.github.com
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */


angular.module('ui.config', []).value('ui.config', {});
angular.module('ui.filters', ['ui.config']);
angular.module('ui.directives', ['ui.config']);
angular.module('ui', ['ui.filters', 'ui.directives', 'ui.config']);

/**
 * Animates the injection of new DOM elements by simply creating the DOM with a class and then immediately removing it
 * Animations must be done using CSS3 transitions, but provide excellent flexibility
 *
 * @todo Add proper support for animating out
 * @param [options] {mixed} Can be an object with multiple options, or a string with the animation class
 *    class {string} the CSS class(es) to use. For example, 'ui-hide' might be an excellent alternative class.
 * @example <li ng-repeat="item in items" ui-animate=" 'ui-hide' ">{{item}}</li>
 */
angular.module('ui.directives').directive('uiAnimate', ['ui.config', '$timeout', function (uiConfig, $timeout) {
  var options = {};
  if (angular.isString(uiConfig.animate)) {
    options['class'] = uiConfig.animate;
  } else if (uiConfig.animate) {
    options = uiConfig.animate;
  }
  return {
    restrict: 'A', // supports using directive as element, attribute and class
    link: function ($scope, element, attrs) {
      var opts = {};
      if (attrs.uiAnimate) {
        opts = $scope.$eval(attrs.uiAnimate);
        if (angular.isString(opts)) {
          opts = {'class': opts};
        }
      }
      opts = angular.extend({'class': 'ui-animate'}, options, opts);

      element.addClass(opts['class']);
      $timeout(function () {
        element.removeClass(opts['class']);
      }, 20, false);
    }
  };
}]);


/*
*  AngularJs Fullcalendar Wrapper for the JQuery FullCalendar
*  inspired by http://arshaw.com/fullcalendar/ 
*  
*  Basic Angular Calendar Directive that takes in live events as the ng-model and watches that event array for changes, to update the view accordingly. 
*  Can also take in an event url as a source object(s) and feed the events per view. 
*
*/

angular.module('ui.directives').directive('uiCalendar',['ui.config', '$parse', function (uiConfig,$parse) {
    uiConfig.uiCalendar = uiConfig.uiCalendar || {};       
    //returns the fullcalendar     
    return {
        require: 'ngModel',
        restrict: 'A',
        scope: {
          events: "=ngModel"
        },
        link: function(scope, elm, $attrs) {
            var ngModel = $parse($attrs.ngModel);
            //update method that is called on load and whenever the events array is changed. 
            function update() {
              //Default View Options
              var expression,
                options = {
                  header: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'month,agendaWeek,agendaDay'
                },
              // add event name to title attribute on mouseover. 
              eventMouseover: function(event, jsEvent, view) {
              if (view.name !== 'agendaDay') {
                $(jsEvent.target).attr('title', event.title);
               }
              },
          
              // Calling the events from the scope through the ng-model binding attribute. 
              events: scope.events
              };          
              //if attrs have been entered to the directive, then create a relative expression. 
              if ($attrs.uiCalendar){
                 expression = scope.$eval($attrs.uiCalendar);
              }
              else{
                expression = {};
              } 
              //extend the options to suite the custom directive.
              angular.extend(options, uiConfig.uiCalendar, expression);
              //call fullCalendar from an empty html tag, to keep angular happy.
              elm.html('').fullCalendar(options);
            }
            //on load update call.
            update();
            //watching the length of the array to create a more efficient update process. 
            scope.$watch( 'events.length', function( newVal, oldVal )
            {
              //update the calendar on every change to events.length
              update();
            }, true );
        }
    };
}]);
/*global angular, CodeMirror, Error*/
/**
 * Binds a CodeMirror widget to a <textarea> element.
 */
angular.module('ui.directives').directive('uiCodemirror', ['ui.config', '$timeout', function (uiConfig, $timeout) {
	'use strict';

	var events = ["cursorActivity", "viewportChange", "gutterClick", "focus", "blur", "scroll", "update"];
	return {
		restrict:'A',
		require:'ngModel',
		link:function (scope, elm, attrs, ngModel) {
			var options, opts, onChange, deferCodeMirror, codeMirror;

			if (elm[0].type !== 'textarea') {
				throw new Error('uiCodemirror3 can only be applied to a textarea element');
			}

			options = uiConfig.codemirror || {};
			opts = angular.extend({}, options, scope.$eval(attrs.uiCodemirror));

			onChange = function (aEvent) {
				return function (instance, changeObj) {
					var newValue = instance.getValue();
					if (newValue !== ngModel.$viewValue) {
						ngModel.$setViewValue(newValue);
						scope.$apply();
					}
					if (typeof aEvent === "function")
						aEvent(instance, changeObj);
				};
			};

			deferCodeMirror = function () {
				codeMirror = CodeMirror.fromTextArea(elm[0], opts);
				codeMirror.on("change", onChange(opts.onChange));

				for (var i = 0, n = events.length, aEvent; i < n; ++i) {
					aEvent = opts["on" + events[i].charAt(0).toUpperCase() + events[i].slice(1)];
					if (aEvent === void 0) continue;
					if (typeof aEvent !== "function") continue;
					codeMirror.on(events[i], aEvent);
				}

				// CodeMirror expects a string, so make sure it gets one.
				// This does not change the model.
				ngModel.$formatters.push(function (value) {
					if (angular.isUndefined(value) || value === null) {
						return '';
					}
					else if (angular.isObject(value) || angular.isArray(value)) {
						throw new Error('ui-codemirror cannot use an object or an array as a model');
					}
					return value;
				});

				// Override the ngModelController $render method, which is what gets called when the model is updated.
				// This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
				ngModel.$render = function () {
					codeMirror.setValue(ngModel.$viewValue);
				};

			};

			$timeout(deferCodeMirror);

		}
	};
}]);

/*
 Gives the ability to style currency based on its sign.
 */
angular.module('ui.directives').directive('uiCurrency', ['ui.config', 'currencyFilter' , function (uiConfig, currencyFilter) {
  var options = {
    pos: 'ui-currency-pos',
    neg: 'ui-currency-neg',
    zero: 'ui-currency-zero'
  };
  if (uiConfig.currency) {
    angular.extend(options, uiConfig.currency);
  }
  return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function (scope, element, attrs, controller) {
      var opts, // instance-specific options
        renderview,
        value;

      opts = angular.extend({}, options, scope.$eval(attrs.uiCurrency));

      renderview = function (viewvalue) {
        var num;
        num = viewvalue * 1;
        if (num > 0) {
          element.addClass(opts.pos);
        } else {
          element.removeClass(opts.pos);
        }
        if (num < 0) {
          element.addClass(opts.neg);
        } else {
          element.removeClass(opts.neg);
        }
        if (num === 0) {
          element.addClass(opts.zero);
        } else {
          element.removeClass(opts.zero);
        }
        if (viewvalue === '') {
          element.text('');
        } else {
          element.text(currencyFilter(num, opts.symbol));
        }
        return true;
      };

      controller.$render = function () {
        value = controller.$viewValue;
        element.val(value);
        renderview(value);
      };

    }
  };
}]);

/*global angular */
/*
 jQuery UI Datepicker plugin wrapper

 @param [ui-date] {object} Options to pass to $.fn.datepicker() merged onto ui.config
 */

angular.module('ui.directives')

.directive('uiDate', ['ui.config', function (uiConfig) {
  'use strict';
  var options;
  options = {};
  if (angular.isObject(uiConfig.date)) {
    angular.extend(options, uiConfig.date);
  }
  return {
    require:'?ngModel',
    link:function (scope, element, attrs, controller) {
      var getOptions = function () {
        return angular.extend({}, uiConfig.date, scope.$eval(attrs.uiDate));
      };
      var initDateWidget = function () {
        var opts = getOptions();

        // If we have a controller (i.e. ngModelController) then wire it up
        if (controller) {
          var updateModel = function () {
            scope.$apply(function () {
              var date = element.datepicker("getDate");
              element.datepicker("setDate", element.val());
              controller.$setViewValue(date);
              element.blur();
            });
          };
          if (opts.onSelect) {
            // Caller has specified onSelect, so call this as well as updating the model
            var userHandler = opts.onSelect;
            opts.onSelect = function (value, picker) {
              updateModel();
              scope.$apply(function() {
                userHandler(value, picker);
              });
            };
          } else {
            // No onSelect already specified so just update the model
            opts.onSelect = updateModel;
          }
          // In case the user changes the text directly in the input box
          element.bind('change', updateModel);

          // Update the date picker when the model changes
          controller.$render = function () {
            var date = controller.$viewValue;
            if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
              throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
            }
            element.datepicker("setDate", date);
          };
        }
        // If we don't destroy the old one it doesn't update properly when the config changes
        element.datepicker('destroy');
        // Create the new datepicker widget
        element.datepicker(opts);
        if ( controller ) {
          // Force a render to override whatever is in the input text box
          controller.$render();
        }
      };
      // Watch for changes to the directives options
      scope.$watch(getOptions, initDateWidget, true);
    }
  };
}
])

.directive('uiDateFormat', [function() {
  var directive = {
    require:'ngModel',
    link: function(scope, element, attrs, modelCtrl) {
      if ( attrs.uiDateFormat === '' ) {
        // Default to ISO formatting
        modelCtrl.$formatters.push(function(value) {
          if (angular.isString(value) ) {
            return new Date(value);
          }
        });
        modelCtrl.$parsers.push(function(value){
          if (value) {
            return value.toISOString();
          }
        });
      } else {
        var format = attrs.uiDateFormat;
        // Use the datepicker with the attribute value as the format string to convert to and from a string
        modelCtrl.$formatters.push(function(value) {
          if (angular.isString(value) ) {
            return $.datepicker.parseDate(format, value);
          }
        });
        modelCtrl.$parsers.push(function(value){
          if (value) {
            return $.datepicker.formatDate(format, value);
          }
        });
      }
    }
  };
  return directive;
}]);

/**
 * General-purpose Event binding. Bind any event not natively supported by Angular
 * Pass an object with keynames for events to ui-event
 * Allows $event object and $params object to be passed
 *
 * @example <input ui-event="{ focus : 'counter++', blur : 'someCallback()' }">
 * @example <input ui-event="{ myCustomEvent : 'myEventHandler($event, $params)'}">
 *
 * @param ui-event {string|object literal} The event to bind to as a string or a hash of events with their callbacks
 */
angular.module('ui.directives').directive('uiEvent', ['$parse',
  function ($parse) {
    return function (scope, elm, attrs) {
      var events = scope.$eval(attrs.uiEvent);
      angular.forEach(events, function (uiEvent, eventName) {
        var fn = $parse(uiEvent);
        elm.bind(eventName, function (evt) {
          var params = Array.prototype.slice.call(arguments);
          //Take out first paramater (event object);
          params = params.splice(1);
          scope.$apply(function () {
            fn(scope, {$event: evt, $params: params});
          });
        });
      });
    };
  }]);

/*
 * Defines the ui-if tag. This removes/adds an element from the dom depending on a condition
 * Originally created by @tigbro, for the @jquery-mobile-angular-adapter
 * https://github.com/tigbro/jquery-mobile-angular-adapter
 */
angular.module('ui.directives').directive('uiIf', [function () {
  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    restrict: 'A',
    compile: function (element, attr, linker) {
      return function (scope, iterStartElement, attr) {
        iterStartElement[0].doNotMove = true;
        var expression = attr.uiIf;
        var lastElement;
        var lastScope;
        scope.$watch(expression, function (newValue) {
          if (lastElement) {
            lastElement.remove();
            lastElement = null;
          }
          if (lastScope) {
            lastScope.$destroy();
            lastScope = null;
          }
          if (newValue) {
            lastScope = scope.$new();
            linker(lastScope, function (clone) {
              lastElement = clone;
              iterStartElement.after(clone);
            });
          }
          // Note: need to be parent() as jquery cannot trigger events on comments
          // (angular creates a comment node when using transclusion, as ng-repeat does).
          iterStartElement.parent().trigger("$childrenChanged");
        });
      };
    }
  };
}]);
/**
 * General-purpose jQuery wrapper. Simply pass the plugin name as the expression.
 *
 * It is possible to specify a default set of parameters for each jQuery plugin.
 * Under the jq key, namespace each plugin by that which will be passed to ui-jq.
 * Unfortunately, at this time you can only pre-define the first parameter.
 * @example { jq : { datepicker : { showOn:'click' } } }
 *
 * @param ui-jq {string} The $elm.[pluginName]() to call.
 * @param [ui-options] {mixed} Expression to be evaluated and passed as options to the function
 *     Multiple parameters can be separated by commas
 *    Set {ngChange:false} to disable passthrough support for change events ( since angular watches 'input' events, not 'change' events )
 *
 * @example <input ui-jq="datepicker" ui-options="{showOn:'click'},secondParameter,thirdParameter">
 */
angular.module('ui.directives').directive('uiJq', ['ui.config', function (uiConfig) {
  return {
    restrict: 'A',
    compile: function (tElm, tAttrs) {
      if (!angular.isFunction(tElm[tAttrs.uiJq])) {
        throw new Error('ui-jq: The "' + tAttrs.uiJq + '" function does not exist');
      }
      var options = uiConfig.jq && uiConfig.jq[tAttrs.uiJq];
      return function (scope, elm, attrs) {
        var linkOptions = [], ngChange = 'change';

        if (attrs.uiOptions) {
          linkOptions = scope.$eval('[' + attrs.uiOptions + ']');
          if (angular.isObject(options) && angular.isObject(linkOptions[0])) {
            linkOptions[0] = angular.extend({}, options, linkOptions[0]);
          }
        } else if (options) {
          linkOptions = [options];
        }
        if (attrs.ngModel && elm.is('select,input,textarea')) {
          if (linkOptions && angular.isObject(linkOptions[0]) && linkOptions[0].ngChange !== undefined) {
            ngChange = linkOptions[0].ngChange;
          }
          if (ngChange) {
            elm.on(ngChange, function () {
              elm.trigger('input');
            });
          }
        }
        elm[attrs.uiJq].apply(elm, linkOptions);
      };
    }
  };
}]);

angular.module('ui.directives').factory('keypressHelper', ['$parse', function keypress($parse){
  var keysByCode = {
    8: 'backspace',
    9: 'tab',
    13: 'enter',
    27: 'esc',
    32: 'space',
    33: 'pageup',
    34: 'pagedown',
    35: 'end',
    36: 'home',
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    45: 'insert',
    46: 'delete'
  };

  var capitaliseFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return function(mode, scope, elm, attrs) {
    var params, combinations = [];
    params = scope.$eval(attrs['ui'+capitaliseFirstLetter(mode)]);

    // Prepare combinations for simple checking
    angular.forEach(params, function (v, k) {
      var combination, expression;
      expression = $parse(v);

      angular.forEach(k.split(' '), function(variation) {
        combination = {
          expression: expression,
          keys: {}
        };
        angular.forEach(variation.split('-'), function (value) {
          combination.keys[value] = true;
        });
        combinations.push(combination);
      });
    });

    // Check only matching of pressed keys one of the conditions
    elm.bind(mode, function (event) {
      // No need to do that inside the cycle
      var altPressed = event.metaKey || event.altKey;
      var ctrlPressed = event.ctrlKey;
      var shiftPressed = event.shiftKey;
      var keyCode = event.keyCode;

      // normalize keycodes
      if (mode === 'keypress' && !shiftPressed && keyCode >= 97 && keyCode <= 122) {
        keyCode = keyCode - 32;
      }

      // Iterate over prepared combinations
      angular.forEach(combinations, function (combination) {

        var mainKeyPressed = (combination.keys[keysByCode[event.keyCode]] || combination.keys[event.keyCode.toString()]) || false;

        var altRequired = combination.keys.alt || false;
        var ctrlRequired = combination.keys.ctrl || false;
        var shiftRequired = combination.keys.shift || false;

        if (
          mainKeyPressed &&
          ( altRequired == altPressed ) &&
          ( ctrlRequired == ctrlPressed ) &&
          ( shiftRequired == shiftPressed )
        ) {
          // Run the function
          scope.$apply(function () {
            combination.expression(scope, { '$event': event });
          });
        }
      });
    });
  };
}]);

/**
 * Bind one or more handlers to particular keys or their combination
 * @param hash {mixed} keyBindings Can be an object or string where keybinding expression of keys or keys combinations and AngularJS Exspressions are set. Object syntax: "{ keys1: expression1 [, keys2: expression2 [ , ... ]]}". String syntax: ""expression1 on keys1 [ and expression2 on keys2 [ and ... ]]"". Expression is an AngularJS Expression, and key(s) are dash-separated combinations of keys and modifiers (one or many, if any. Order does not matter). Supported modifiers are 'ctrl', 'shift', 'alt' and key can be used either via its keyCode (13 for Return) or name. Named keys are 'backspace', 'tab', 'enter', 'esc', 'space', 'pageup', 'pagedown', 'end', 'home', 'left', 'up', 'right', 'down', 'insert', 'delete'.
 * @example <input ui-keypress="{enter:'x = 1', 'ctrl-shift-space':'foo()', 'shift-13':'bar()'}" /> <input ui-keypress="foo = 2 on ctrl-13 and bar('hello') on shift-esc" />
 **/
angular.module('ui.directives').directive('uiKeydown', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keydown', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.directives').directive('uiKeypress', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keypress', scope, elm, attrs);
    }
  };
}]);

angular.module('ui.directives').directive('uiKeyup', ['keypressHelper', function(keypressHelper){
  return {
    link: function (scope, elm, attrs) {
      keypressHelper('keyup', scope, elm, attrs);
    }
  };
}]);
/**
@todo
- for scrolling loading more, remove "load more" button at bottom BUT auto load until get a scroll bar (otherwise could never trigger it?). And the programmer should call this directive with enough items to populate 1 page to show a scroll bar the first time (so add that to this documenation & also document that they should add a height & overflow:auto to ui-lookup-content in css for it to scroll)
- style it (just the search box, load more button, etc.?)

Uses one associative array (raw data) to build a concatenated scalar (final/display) array of items to search / filter.
	- handles paging / loading more when scroll to bottom
	- can be used with a backend lookup call to load more results (if "loadMore" attr/scope function is passed in)
		- loadMore function is called when have less than full results among current filtered items stored in javascript, which happens 1 of 2 ways:
			1. when scroll to end of page / load more results
			2. when change search text
	- NOTE: a queue is used to pre-fill the NEXT page's content so more results should always appear fast since the next page's items should already be in javascript by the time "load more" is clicked (i.e. the AJAX / external call is done right AFTER the previous page is loaded rather than right before the new page is loaded)

//TOC
//0.5. init
//1. formItems
//2. $scope.filterItems
//3. $scope.clickInput
//4. $scope.changeInput
//5. $scope.$watch('itemsRaw',..
//6. $scope.loadMoreDir
//7. getMoreItems
//8. addLoadMoreItems

attrs
	REQUIRED
	searchText {String} text to search for (will be used as ng-model for input)
	watchItemKeys =array [] of keys to $watch; if these are updated in $scope (i.e. outside the directive), it will re-form itemsFiltered in the directive
		DEFAULT: ['default']
	itemsRaw =array {} of arrays {}, one per each "type". Each type must contain an "items" field that's a scalar array of the items for this type
		EXAMPLE:
		{
			'default':{
				'items':[
					{'first':'john', 'last':'smith'},
					{'first':'joe', 'last':'bob'},
					..
				],
			}
			'loadMore':{
				'items':[
					{'first':'sally', 'last':'sue'},
					{'first':'barbara', 'last':'ann'},
					..
				],
			}
		}
	itemsFiltered =array [] placeholder for where the final, concatenated items will be stored; this is the array that will actually be displayed and searched through and is a combination of the itemsRaw[type].items arrays
	filterFields =array [] of all fields in each items array to search for match
		EXAMPLE: ['first', 'last', 'header.title']
			NOTE: 'header.title' will search in header['title'] if filterFieldsDotNotation is set to true. Otherwise it will look in a NON-NESTED key that has a "." as part of it
				i.e. array['header.title'] VS array['header']['title']
	OPTIONAL
	filterFieldsDotNotation =boolean true to change all periods to sub array's (i.e. so 'header.title' as a filterField would search in header['title'] for a match)
		DEFAULT: true
	scrollLoad =1 to do paging via scrolling
		DEFAULT: 0
	loadMore =function to call to load more results (this should update $scope.itemsRaw, which will then update in the directive via $watch)
	pageSize =int of how many results to show at a time (will load more in increments of pageSize as scroll down / click "more")
		DEFAULT: 10
	loadMorePageSize =int of how many results to load (& thus store in queue) at a time - must be at least as large as pageSize (and typically should be at least 2 times as big as page size?? maybe not? just need to ensure never have to AJAX twice to display 1 page)
		DEFAULT: 20
	loadMoreItemsKey =string that matches a key in the itemsRaw array - this is where items from backend will loaded into
		DEFAULT: loadMore
	placeholder =string of input search placeholder (default "search")
	//id =string of instance id for this copy of the directive


EXAMPLE usage:
partial / html:
	<div ui-lookup items-raw='usersRaw' items-filtered='users' filter-fields='filterFields' load-more='loadMore' search-text='searchText' watch-item-keys='watchItemKeys'>
		<!-- custom display code to ng-repeat and display the results (items-filtered) goes below -->
		<div class='friends-user' ng-repeat='user in users'>
			{{user.name}}
		</div>
		<!-- end: custom display code -->
	</div>

controller / js:
	$scope.searchText ='';
	$scope.watchItemKeys =['default'];
	$scope.users =[];
	$scope.filterFields =['name'];
	$scope.usersRaw ={
		'default':{
			'items':[
				{'_id':'d1', 'name':'john smith'},
				{'_id':'d2', 'name':'joe bob'},
				{'_id':'d3', 'name':'joe james'},
				{'_id':'d4', 'name':'ron artest'},
				{'_id':'d5', 'name':'kobe bryant'},
				{'_id':'d6', 'name':'steve balls'},
			],
		},
		'loadMore':{
			'items':[
			],
		},
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
		{'_id':'l8', 'name':'pau gasol'},
	];
	
	//@param params
	//	cursor =int of where to load from
	//	loadMorePageSize =int of how many to return
	$scope.loadMore =function(params, callback) {
		var results =itemsMore.slice(params.cursor, (params.cursor+params.loadMorePageSize));
		callback(results, {});
	};

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiLookup', ['ui.config', '$filter', '$compile', '$timeout', function (uiConfig, $filter, $compile, $timeout) {

	/**
	//returns the value of an array when given the array base and the keys to read
	@param arrayBase =array starting point (after which the array keys are added in)
	@param params
		keys (required) =dotNotation version of keys to add in order (i.e. 'header.title')
		noDotNotation =boolean true if keys is an array [] rather than a dot notation string
	@return array {}
		val =value of this array after the keys have been added
		valid =1 if val was figured out; 0 if error
		msg =notes on what happened (i.e. error message if valid =0)
	//EXAMPLE:
	$scope.formVals ={
		'header':{
			'title':'Save Bears',
		},
	};
	//then to get the value of header.title (i.e. "Save Bears"), would do:
	//WITH noDotNotation
	evalArray($scope.formVals, {'keys':['header', 'title']});
	//WITHOUT noDotNotation
	evalArray($scope.formVals, {'keys':'header.title'});
	*/
	function evalArray(arrayBase, params) {
		var retArray ={'val':'', 'valid':1, 'msg':''};
		if(params.noDotNotation ==undefined || !params.noDotNotation) {
			params.keys =params.keys.split(".");
		}
		if(params.keys.length ==1) {
			if(arrayBase[params.keys[0]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]];
			}
		}
		else if(params.keys.length ==2) {
			if(arrayBase[params.keys[0]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]];
			}
		}
		else if(params.keys.length ==3) {
			if(arrayBase[params.keys[0]] !=undefined && arrayBase[params.keys[0]][params.keys[1]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]];
			}
		}
		else if(params.keys.length ==4) {
			if(arrayBase[params.keys[0]] !=undefined && arrayBase[params.keys[0]][params.keys[1]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]];
			}
		}
		else if(params.keys.length ==5) {
			if(arrayBase[params.keys[0]] !=undefined && arrayBase[params.keys[0]][params.keys[1]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]];
			}
		}
		else if(params.keys.length ==6) {
			if(arrayBase[params.keys[0]] !=undefined && arrayBase[params.keys[0]][params.keys[1]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]] !=undefined && arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]] !=undefined) {
				retArray.val =arrayBase[params.keys[0]][params.keys[1]][params.keys[2]][params.keys[3]][params.keys[4]][params.keys[5]];
			}
		}
		else {
			retArray.valid =0;
			retArray.msg ='Too deep / too many keys; can only handle key length up to 6';
		}
		return retArray;
	}
	
  return {
		restrict: 'A',
		transclude: true,
		scope: {
			itemsRaw: '=',
			itemsFiltered: '=',
			filterFields:'=',
			watchItemKeys:'=',		//note: this is not required & will throw an error if not set but it still works? @todo fix this so it's not required & doesn't throw error?
			loadMore:'&',
			searchText:'=',
		},

		compile: function(element, attrs) {
			var defaults ={'pageSize':10, 'placeholder':'search', 'scrollLoad':'0', 'loadMorePageSize':20, 'loadMoreItemsKey':'loadMore', 'filterFieldsDotNotation':true};
			for(var xx in defaults) {
				if(attrs[xx] ==undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			//convert to int
			attrs.pageSize =parseInt(attrs.pageSize);
			attrs.loadMorePageSize =parseInt(attrs.loadMorePageSize);
			attrs.scrollLoad =parseInt(attrs.scrollLoad);
			//ensure loadMorePageSize is at least as large as pageSize
			if(attrs.loadMorePageSize <attrs.pageSize) {
				attrs.loadMorePageSize =attrs.pageSize;
			}
			if(attrs.id ==undefined) {
				attrs.id ="uiLookup"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			attrs.ids ={
				'input':id1+"Input",
				'contentBottom':id1+"ContentBottom",
				'inputBelow':id1+"InputBelow",
				'scrollContent':id1+"ScrollContent",
			};
			
			if(0) {
			//NOTE: really weird behavior here; only the FIRST ng-[x] handler works; everything after that doesn't.. so have to give everything else id's (at least the parent elements) then $compile them each in link function..
			var html ="";
			html+="<div class='ui-lookup-top'>";		//this is NECESSARY to ensure all ng-[x] handlers work; only the first parent works without manually compiling pieces in link function so have to wrap this in a container so everything inside of it will work..
				html+="<div class='ui-lookup-input-div'>"+
					//"<input id='"+attrs.ids.input+"' type='text' ng-change='filterItems({})' placeholder='"+attrs.placeholder+"' class='ui-lookup-input' ng-model='searchText' ng-click='clickInput({})' ng-change='changeInput({})' />"+
					"<input type='text' ng-change='changeInput({})' placeholder='"+attrs.placeholder+"' class='ui-lookup-input' ng-model='searchText' ng-click='clickInput({})' />"+
				"</div>"+
				//"<div id='"+attrs.ids.inputBelow+"'>"+
					//"<div ng-click='testFxn({})'>ng-click test</div>"+		//TESTING
					"<div>page: {{page}} totFilteredItems: {{totFilteredItems}} queuedItems: {{queuedItems.length}}</div>"+		//TESTING
					"<div ng-show='itemsFiltered.length <1'>No matches</div>";
				//"</div>";
					//html+="<div id='yes' class='ui-lookup-more' ng-click='loadMoreDir({})'>Load More</div>";
			html+="</div>";
			
			var htmlContentBottom ="<div id='"+attrs.ids.contentBottom+"'>"+
				"<div ng-hide='noMoreLoadMoreItems && queuedItems.length <1' class='ui-lookup-more' ng-click='loadMoreDir({})'>Load More</div>"+
				"<div ng-show='noMoreLoadMoreItems && queuedItems.length <1' class='ui-lookup-no-more'>No More Results!</div>"+
			"</div>";
			//htmlEnd+="</div>";
			
			//element.replaceWith(html);
			element.replaceWith(html+"<div id='"+attrs.ids.scrollContent+"' class='ui-lookup-content'>"+element.html()+htmlContentBottom+"</div>");
			//element.parent().after(htmlEnd);
			
			return function(scope, element, attrs) {
				//NOTE: really weird behavior here; only the FIRST ng-[x] handler works; everything after that doesn't.. so have to give everything else id's (at least the parent elements) then $compile them each in link function..
				$compile($("#"+attrs.ids.contentBottom))(scope);
				//$compile($("#"+attrs.ids.inputBelow))(scope);
				//$compile($(".ui-lookup-top"))(scope);
			};
			}
			
			else {
			var html="<div class='ui-lookup'>"+
				"<div class='ui-lookup-top'>"+
					"<div class='ui-lookup-input-div'>"+
						"<input type='text' ng-change='changeInput({})' placeholder='"+attrs.placeholder+"' class='ui-lookup-input' ng-model='searchText' ng-click='clickInput({})' />"+
					"</div>"+
					"<div>page: {{page}} totFilteredItems: {{totFilteredItems}} queuedItems: {{queuedItems.length}}</div>"+		//TESTING
					"<div ng-show='itemsFiltered.length <1'>No matches</div>"+
				"</div>"+
				"<div id='"+attrs.ids.scrollContent+"' class='ui-lookup-content' ng-transclude></div>"+
				"<div id='"+attrs.ids.contentBottom+"'>"+
					"<div ng-hide='noMoreLoadMoreItems && queuedItems.length <1' class='ui-lookup-more' ng-click='loadMoreDir({})'>Load More</div>"+
					"<div ng-show='noMoreLoadMoreItems && queuedItems.length <1' class='ui-lookup-no-more'>No More Results!</div>"+
				"</div>"+
			"</div>";
				
			element.replaceWith(html);
			}
		},
		
		controller: function($scope, $element, $attrs) {
			var defaults ={
				'watchItemKeys':['default'],
			};
			for(var xx in defaults) {
				if($scope[xx] ==undefined) {
					$scope[xx] =defaults[xx];
				}
			}
			
			if($scope.searchText ==undefined) {
				$scope.searchText ='';
			}
			$scope.trigs ={'loading':false};
			$scope.items =[];
			$scope.page =1;		//will store what page (broken up by pageSize attr) we're on
			$scope.totFilteredItems =0;
			$scope.queuedItems =[];		//will hold load more items (i.e. from backend) so can always load at least a page ahead and be fast; i.e. when need to display more items, will just load them from queue (without AJAXing / talking to backend) and THEN after displaying (& removing from queue) the new items, IF still don't have enough for the NEXT page, THEN go to backend to preload the next page's worth of items. This way the AJAXing happens AFTER each page is loaded so it should be ready for the next page as opposed to BEFORE (in which case there's a lag while waiting for the items to return)
			var cursors ={		//will hold cursors for items to know where to append to / load more from
				'loadMore':0,
			};
			$scope.noMoreLoadMoreItems =false;		//boolean that will be set to true if (backend) has no more items (i.e. we're at the end of the list and can't load any more)
			
			$scope.testFxn =function(params) {
				alert("test");
			};
			
			var timeoutInfo ={
				'search': {
					'trig':false,
					'delay':750,
				},
				'scrolling':{
					'trig':false,
					'delay':750,
				},
			};
			
			/*
			var keycodes ={
				'enter':13,
			};
			
			$("#"+attrs.ids.input).keyup(function(evt) {
				$scope.keyupInput(evt, {});
			});
			*/
			
			//add scroll handle to load more
			if($attrs.scrollLoad) {
				document.getElementById($attrs.ids.scrollContent).onscroll =function() {
					$timeout.cancel(timeoutInfo.scrolling.trig);
					$timeout.cancel(timeoutInfo.search.trig);
					timeoutInfo.scrolling.trig =$timeout(function() {
						//console.log('uiLookup timeout scrolling loading');
						var buffer =25;
						var ele =document.getElementById($attrs.ids.scrollContent);
						var scrollPos =ele.scrollTop;
						var scrollHeight =ele.scrollHeight;
						var height1 =$(ele).height();
						//console.log("pos: "+scrollPos+" height: "+scrollHeight+" height: "+height1);
						if(scrollPos >=(scrollHeight-height1-buffer)) {
							$scope.loadMoreDir({'noDelay':true});
						}
					}, timeoutInfo.scrolling.delay);
				};
			}
			
			//0.5.
			function init(params) {
				formItems({});
				if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
					$scope.loadMoreDir({});
				}
			}
			
			//0.75.
			function resetItems(params) {
				$scope.page =1;		//reset
				$scope.noMoreLoadMoreItems =false;
				$scope.queuedItems =[];
				cursors ={
					'loadMore':0,
				};
				$scope.itemsRaw[$attrs.loadMoreItemsKey].items =[];
				$("#"+$attrs.ids.scrollContent).scrollTop(0);
			}
			
			//1.
			/*
			concats all types in itemsRaw into a final set of items to be selected from / displayed
			@param params
				OPTIONAL
				keys =array [] of which itemsRaw keys to copy over; otherwise all will be copied over
			*/
			function formItems(params) {
				if(params.keys !=undefined) {
					var keys =params.keys;
				}
				else {		//copy them all
					var keys =[];
					var counter =0;
					for(var xx in $scope.itemsRaw) {
						keys[counter] =xx;
						counter++;
					}
				}
				$scope.items =[];		//reset first
				for(var ii =0; ii<keys.length; ii++) {
					$scope.items =$scope.items.concat($scope.itemsRaw[keys[ii]].items);
				}
				
				$scope.filterItems({});		//search / re-filter
			}
			
			//2.
			$scope.filterItems =function(params) {
				//$scope.itemsFiltered =$filter('filter')($scope.items, {name:$scope.searchText});
				var curItem =false;
				var searchText1 =$scope.searchText.toLowerCase();
				if(searchText1.length <1) {
					$scope.itemsFiltered =$scope.items;
				}
				else {		//filter
					$scope.itemsFiltered =$filter('filter')($scope.items, function(item) {
						var match =false;
						for(var ii=0; ii<$scope.filterFields.length; ii++) {
							if($attrs.filterFieldsDotNotation && $scope.filterFields[ii].indexOf('.') >-1) {
								var retArray1 =evalArray(item, {'keys':$scope.filterFields[ii]});
								if(retArray1.val !=undefined) {
									curItem =retArray1.val;
								}
								else {
									curItem =false;
								}
							}
							else {
								if(item[$scope.filterFields[ii]] !=undefined) {
									var curItem =item[$scope.filterFields[ii]];
								}
								else {
									curItem =false;
								}
							}
							if(curItem) {
								curItem =curItem.toLowerCase();
								if(curItem.indexOf(searchText1) >-1) {
									match =true;
									break;
								}
							}
						}
						return match;
					});
				}
				$scope.totFilteredItems =$scope.itemsFiltered.length;
				$scope.itemsFiltered =$scope.itemsFiltered.slice(0, $scope.page*$attrs.pageSize);
			};
			
			//3.
			$scope.clickInput =function(params) {
				$scope.filterItems({});
			};
			
			//4.
			$scope.changeInput =function(params) {
				resetItems({});
				//$scope.filterItems({});
				formItems({});
				//reset timeout
				if(timeoutInfo.search.trig) {
					$timeout.cancel(timeoutInfo.search.trig);
				}
				//set timeout if don't have full items
				if($scope.totFilteredItems <$scope.page*$attrs.pageSize) {
					timeoutInfo.search.trig =$timeout(function() {
						getMoreItems({});
					}, timeoutInfo.search.delay);
				}
			};
			
			//5.
			/*
			//doesn't work - have to watch a sub array piece
			$scope.$watch('itemsRaw', function(newVal, oldVal) {
				if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
					formItems({});
				}
			});
			*/
			//for(var xx in $scope.itemsRaw) {
			for(var ii =0; ii<$scope.watchItemKeys.length; ii++) {
				var xx =$scope.watchItemKeys[ii];
				//$scope.$watch('itemsRaw', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw['+xx+'].items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.loadMore.items[0]', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.loadMore', function(newVal, oldVal) {
				//$scope.$watch('itemsRaw.'+xx, function(newVal, oldVal) {
				$scope.$watch('itemsRaw.'+xx+'.items', function(newVal, oldVal) {
					if(!angular.equals(oldVal, newVal)) {		//very important to do this for performance reasons since $watch runs all the time
						formItems({});
						/*
						if($scope.queuedItems.length <$attrs.pageSize && $scope.totFilteredItems <$scope.page*$attrs.pageSize) {		//load more externally if don't have enough
							$scope.loadMoreDir({});
						}
						*/
					}
				});
			}
			
			//5.5. $watch not firing all the time... @todo figure out & fix this.. (also this will reform ALL instances - should pass in an instance id - which means the directive would have to pass an instance back somehow..)
			$scope.$on('uiLookupReformItems', function(evt, params) {
				formItems({});
			});
			
			//6.
			/*
			Starts the load more process - checks if need to load more (may already have more items in the existing javascript filtered items array, in which case can just load more internally) and IF need to load more external items, sets a timeout to do so (for performance to avoid rapid firing external calls)
				This is paired with the getMoreItems function below - which handles actually getting the items AFTER the timeout
			@param params
				noDelay =boolean true to skip the timeout before loading more (i.e. if coming from scroll, in which case already have waited)
			*/
			$scope.loadMoreDir =function(params) {
				var getMoreItemsTrig =false;
				//if have more filtered items left, increment page & show them
				if($scope.totFilteredItems >$scope.page*$attrs.pageSize) {
					//if this next NEXT page will be less than full, get more items (i.e. from backend) to fill queue
					if($scope.totFilteredItems <($scope.page+2)*$attrs.pageSize) {
						getMoreItemsTrig =true;
					}
					$scope.page++;
					$scope.filterItems({});
				}
				else {
					getMoreItemsTrig =true;
				}
				//set timeout to get more from backend if function has been given for how to do so
				params.noDelay =true;		//never want to timeout here? Handle that outside this function (should only have on search and on scroll and it's already handled there?)
				if(getMoreItemsTrig) {
					if(params.noDelay) {
						getMoreItems({});
					}
					else {
						timeoutInfo.search.trig =$timeout(function() {
							getMoreItems({});
						}, timeoutInfo.search.delay);
					}
				}
			};
			
			//7.
			/*
			Handles loading items from the queue and calling the external loadMore function to pre-fill the queue for the next page (this is the function that runs AFTER the timeout set in $scope.loadMoreDir function)
			If have items in queue, they're added to itemsRaw and then formItems is re-called to re-form filtered items & update display
			*/
			function getMoreItems(params) {
				if($scope.loadMore !=undefined) {
					/*
					$scope.loadMore();
					*/
					var retQueue =addItemsFromQueue({});
					var ppTemp ={};
					if(!retQueue.pageFilled) {
						ppTemp.partialLoad =true;
						ppTemp.numToFillCurPage =$attrs.pageSize-retQueue.numItemsAdded;
						if($scope.page*$attrs.pageSize >$scope.totFilteredItems && $scope.totFilteredItems >(($scope.page-1)*$attrs.pageSize)) {		//if have page partially filled by filtered items (but not completely blank), have to subtract that as well
							ppTemp.numToFillCurPage -=$scope.page*$attrs.pageSize -$scope.totFilteredItems;
						}
					}
					//if AFTER loading items from queue, remaining items are less than pageSize, NOW load more (i.e. AJAX to backend) to re-populate queue
					if($scope.queuedItems.length <$attrs.pageSize) {
						if(!$scope.noMoreLoadMoreItems) {		//only try to load more if have more left to load
							var loadPageSize =$attrs.loadMorePageSize;
							if(ppTemp.partialLoad) {		//need to load extra since need to immediately fill the existing page first
								if(loadPageSize <($attrs.pageSize+ppTemp.numToFillCurPage)) {
									loadPageSize =$attrs.pageSize+ppTemp.numToFillCurPage;
									ppTemp.loadPageSize =loadPageSize;
								}
							}
							$scope.loadMore()({'cursor':cursors.loadMore, 'loadMorePageSize':loadPageSize, 'searchText':$scope.searchText}, function(results, ppCustom) {
								addLoadMoreItems(results, ppCustom, ppTemp);
							});
						}
					}
				}
			}
			
			//7.5.
			/*
			@param params
				OPTIONAL
				numToAdd =int of number of items to pull from queue (if not set, will take a full page's worth or the number left in queue, whichever is greater)
				partialLoad =boolean true if just filling the existing page (don't increment page counter)
			@return array {}
				pageFilled =boolean if had enough items in queue to fill the current page (otherwise need to add more immediately to fill it)
				numItemsAdded =int of how many items were added from query
			*/
			function addItemsFromQueue(params) {
				var retArray ={'pageFilled':false, 'numItemsAdded':0};
				//add items from queue (if exists)
				if($scope.queuedItems.length >0) {
					if(params.numToAdd) {
						var numFromQueue =params.numToAdd;
						if($scope.queuedItems.length <numFromQueue) {
							numFromQueue =$scope.queuedItems.length;
						}
					}
					else if($scope.queuedItems.length >=$attrs.pageSize) {
						var numFromQueue =$attrs.pageSize;
						retArray.pageFilled =true;
					}
					else {
						var numFromQueue =$scope.queuedItems.length;
					}
					retArray.numItemsAdded =numFromQueue;
					//add to itemsRaw then update filtered items
					$scope.itemsRaw[$attrs.loadMoreItemsKey].items =$scope.itemsRaw[$attrs.loadMoreItemsKey].items.concat($scope.queuedItems.slice(0, numFromQueue));
					if(params.partialLoad ==undefined || !params.partialLoad || numFromQueue ==$attrs.pageSize) {		//partial load can be set if need to load a new page so may still need to increment page if loading same number of items as page size
						$scope.page++;
					}
					formItems({});
					//remove from queue
					$scope.queuedItems =$scope.queuedItems.slice(numFromQueue, $scope.queuedItems.length);
				}
				return retArray;
			}
			
			//8.
			/*
			This is the callback function that is called from the outer (non-directive) controller with the externally loaded items. These items are added to the queue and the cursor is updated accordingly.
				- Additionally, the noMoreLoadMoreItems trigger is set if the returned results are less than the loadMorePageSize
				- Also, it immediately will load from queue if the current page isn't full yet (if params.partialLoad & params.numToFillCurPage are set)
			@param results =array [] of items (will be appended to queue)
			@param ppCustom =params returned from callback
			@param params
				partialLoad =boolean true if need to immediately fill the current page
				numToFillCurPage =int of how many to immediately load from queue
				loadPageSize =int of how many were attempted to be loaded externally (may be larger than $attrs.loadMorePageSize if are doing a partial load as well as the next page load)
			*/
			function addLoadMoreItems(results, ppCustom, params) {
				//$scope.queuedItems.push(results);		//doesn't work - nests array too deep; use concat instead..
				$scope.queuedItems =$scope.queuedItems.concat(results);
				cursors.loadMore +=results.length;		//don't just add $attrs.loadMorePageSize in case there weren't enough items on the backend (i.e. results could be LESS than this)
				//if don't have enough results, assume backend is done so are out of items
				if(results.length <$attrs.loadMorePageSize || (params.loadPageSize !=undefined && results.length <params.loadPageSize)) {
					$scope.noMoreLoadMoreItems =true;
				}
				//if current page isn't full, immediately pull some from queue
				if(params.partialLoad) {
					var retQueue =addItemsFromQueue({'partialLoad':true, 'numToAdd':params.numToFillCurPage});
				}
			}
			
			init({});		//init (called once when directive first loads)
		},
	};
}]);

(function () {
  var app = angular.module('ui.directives');

  //Setup map events from a google map object to trigger on a given element too,
  //then we just use ui-event to catch events from an element
  function bindMapEvents(scope, eventsStr, googleObject, element) {
    angular.forEach(eventsStr.split(' '), function (eventName) {
      //Prefix all googlemap events with 'map-', so eg 'click' 
      //for the googlemap doesn't interfere with a normal 'click' event
      var $event = { type: 'map-' + eventName };
      google.maps.event.addListener(googleObject, eventName, function (evt) {
        element.trigger(angular.extend({}, $event, evt));
        //We create an $apply if it isn't happening. we need better support for this
        //We don't want to use timeout because tons of these events fire at once,
        //and we only need one $apply
        if (!scope.$$phase) scope.$apply();
      });
    });
  }

  app.directive('uiMap',
    ['ui.config', '$parse', function (uiConfig, $parse) {

      var mapEvents = 'bounds_changed center_changed click dblclick drag dragend ' +
        'dragstart heading_changed idle maptypeid_changed mousemove mouseout ' +
        'mouseover projection_changed resize rightclick tilesloaded tilt_changed ' +
        'zoom_changed';
      var options = uiConfig.map || {};

      return {
        restrict: 'A',
        //doesn't work as E for unknown reason
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          var map = new google.maps.Map(elm[0], opts);
          var model = $parse(attrs.uiMap);

          //Set scope variable for the map
          model.assign(scope, map);

          bindMapEvents(scope, mapEvents, map, elm);
        }
      };
    }]);

  app.directive('uiMapInfoWindow',
    ['ui.config', '$parse', '$compile', function (uiConfig, $parse, $compile) {

      var infoWindowEvents = 'closeclick content_change domready ' +
        'position_changed zindex_changed';
      var options = uiConfig.mapInfoWindow || {};

      return {
        link: function (scope, elm, attrs) {
          var opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
          opts.content = elm[0];
          var model = $parse(attrs.uiMapInfoWindow);
          var infoWindow = model(scope);

          if (!infoWindow) {
            infoWindow = new google.maps.InfoWindow(opts);
            model.assign(scope, infoWindow);
          }

          bindMapEvents(scope, infoWindowEvents, infoWindow, elm);

          /* The info window's contents dont' need to be on the dom anymore,
           google maps has them stored.  So we just replace the infowindow element
           with an empty div. (we don't just straight remove it from the dom because
           straight removing things from the dom can mess up angular) */
          elm.replaceWith('<div></div>');

          //Decorate infoWindow.open to $compile contents before opening
          var _open = infoWindow.open;
          infoWindow.open = function open(a1, a2, a3, a4, a5, a6) {
            $compile(elm.contents())(scope);
            _open.call(infoWindow, a1, a2, a3, a4, a5, a6);
          };
        }
      };
    }]);

  /* 
   * Map overlay directives all work the same. Take map marker for example
   * <ui-map-marker="myMarker"> will $watch 'myMarker' and each time it changes,
   * it will hook up myMarker's events to the directive dom element.  Then
   * ui-event will be able to catch all of myMarker's events. Super simple.
   */
  function mapOverlayDirective(directiveName, events) {
    app.directive(directiveName, [function () {
      return {
        restrict: 'A',
        link: function (scope, elm, attrs) {
          scope.$watch(attrs[directiveName], function (newObject) {
            bindMapEvents(scope, events, newObject, elm);
          });
        }
      };
    }]);
  }

  mapOverlayDirective('uiMapMarker',
    'animation_changed click clickable_changed cursor_changed ' +
      'dblclick drag dragend draggable_changed dragstart flat_changed icon_changed ' +
      'mousedown mouseout mouseover mouseup position_changed rightclick ' +
      'shadow_changed shape_changed title_changed visible_changed zindex_changed');

  mapOverlayDirective('uiMapPolyline',
    'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');

  mapOverlayDirective('uiMapPolygon',
    'click dblclick mousedown mousemove mouseout mouseover mouseup rightclick');

  mapOverlayDirective('uiMapRectangle',
    'bounds_changed click dblclick mousedown mousemove mouseout mouseover ' +
      'mouseup rightclick');

  mapOverlayDirective('uiMapCircle',
    'center_changed click dblclick mousedown mousemove ' +
      'mouseout mouseover mouseup radius_changed rightclick');

  mapOverlayDirective('uiMapGroundOverlay',
    'click dblclick');

})();
/*
 Attaches jquery-ui input mask onto input element
 */
angular.module('ui.directives').directive('uiMask', [
  function () {
    return {
      require:'ngModel',
      link:function ($scope, element, attrs, controller) {

        /* We override the render method to run the jQuery mask plugin
         */
        controller.$render = function () {
          var value = controller.$viewValue || '';
          element.val(value);
          element.mask($scope.$eval(attrs.uiMask));
        };

        /* Add a parser that extracts the masked value into the model but only if the mask is valid
         */
        controller.$parsers.push(function (value) {
          //the second check (or) is only needed due to the fact that element.isMaskValid() will keep returning undefined
          //until there was at least one key event
          var isValid = element.isMaskValid() || angular.isUndefined(element.isMaskValid()) && element.val().length>0;
          controller.$setValidity('mask', isValid);
          return isValid ? value : undefined;
        });

        /* When keyup, update the view value
         */
        element.bind('keyup', function () {
          $scope.$apply(function () {
            controller.$setViewValue(element.mask());
          });
        });
      }
    };
  }
]);

angular.module('ui.directives')
.directive('uiModal', ['$timeout', function($timeout) {
  return {
    restrict: 'EAC',
    require: 'ngModel',
    link: function(scope, elm, attrs, model) {
      //helper so you don't have to type class="modal hide"
      elm.addClass('modal hide');
      elm.on( 'shown', function() {
        elm.find( "[autofocus]" ).focus();
      });
      scope.$watch(attrs.ngModel, function(value) {
        elm.modal(value && 'show' || 'hide');
      });
      //If bootstrap animations are enabled, listen to 'shown' and 'hidden' events
      elm.on(jQuery.support.transition && 'shown' || 'show', function() {
        $timeout(function() {
          model.$setViewValue(true);
        });
      });
      elm.on(jQuery.support.transition && 'hidden' || 'hide', function() {
        $timeout(function() {
          model.$setViewValue(false);
        });
      });
    }
  };
}]);
/**
 * Add a clear button to form inputs to reset their value
 */
angular.module('ui.directives').directive('uiReset', ['ui.config', function (uiConfig) {
  var resetValue = null;
  if (uiConfig.reset !== undefined)
      resetValue = uiConfig.reset;
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      var aElement;
      aElement = angular.element('<a class="ui-reset" />');
      elm.wrap('<span class="ui-resetwrap" />').after(aElement);
      aElement.bind('click', function (e) {
        e.preventDefault();
        scope.$apply(function () {
          if (attrs.uiReset)
            ctrl.$setViewValue(scope.$eval(attrs.uiReset));
          else
            ctrl.$setViewValue(resetValue);
          ctrl.$render();
        });
      });
    }
  };
}]);

/*global angular, $, document*/
/**
 * Adds a 'ui-scrollfix' class to the element when the page scrolls past it's position.
 * @param [offset] {int} optional Y-offset to override the detected offset.
 *   Takes 300 (absolute) or -300 or +300 (relative to detected)
 */
angular.module('ui.directives').directive('uiScrollfix', ['$window', function ($window) {
  'use strict';
  return {
    link: function (scope, elm, attrs) {
      var top = elm.offset().top;
      if (!attrs.uiScrollfix) {
        attrs.uiScrollfix = top;
      } else {
        // chartAt is generally faster than indexOf: http://jsperf.com/indexof-vs-chartat
        if (attrs.uiScrollfix.charAt(0) === '-') {
          attrs.uiScrollfix = top - attrs.uiScrollfix.substr(1);
        } else if (attrs.uiScrollfix.charAt(0) === '+') {
          attrs.uiScrollfix = top + parseFloat(attrs.uiScrollfix.substr(1));
        }
      }
      angular.element($window).on('scroll.ui-scrollfix', function () {
        // if pageYOffset is defined use it, otherwise use other crap for IE
        var offset;
        if (angular.isDefined($window.pageYOffset)) {
          offset = $window.pageYOffset;
        } else {
          var iebody = (document.compatMode && document.compatMode !== "BackCompat") ? document.documentElement : document.body;
          offset = iebody.scrollTop;
        }
        if (!elm.hasClass('ui-scrollfix') && offset > attrs.uiScrollfix) {
          elm.addClass('ui-scrollfix');
        } else if (elm.hasClass('ui-scrollfix') && offset < attrs.uiScrollfix) {
          elm.removeClass('ui-scrollfix');
        }
      });
    }
  };
}]);

/**
 * Enhanced Select2 Dropmenus
 *
 * @AJAX Mode - When in this mode, your value will be an object (or array of objects) of the data used by Select2
 *     This change is so that you do not have to do an additional query yourself on top of Select2's own query
 * @params [options] {object} The configuration options passed to $.fn.select2(). Refer to the documentation
 */
angular.module('ui.directives').directive('uiSelect2', ['ui.config', '$http', function (uiConfig, $http) {
  var options = {};
  if (uiConfig.select2) {
    angular.extend(options, uiConfig.select2);
  }
  return {
    require: '?ngModel',
    compile: function (tElm, tAttrs) {
      var watch,
        repeatOption,
		repeatAttr,
        isSelect = tElm.is('select'),
        isMultiple = (tAttrs.multiple !== undefined);

      // Enable watching of the options dataset if in use
      if (tElm.is('select')) {
        repeatOption = tElm.find('option[ng-repeat], option[data-ng-repeat]');

        if (repeatOption.length) {
		      repeatAttr = repeatOption.attr('ng-repeat') || repeatOption.attr('data-ng-repeat');
          watch = jQuery.trim(repeatAttr.split('|')[0]).split(' ').pop();
        }
      }

      return function (scope, elm, attrs, controller) {
        // instance-specific options
        var opts = angular.extend({}, options, scope.$eval(attrs.uiSelect2));

        if (isSelect) {
          // Use <select multiple> instead
          delete opts.multiple;
          delete opts.initSelection;
        } else if (isMultiple) {
          opts.multiple = true;
        }

        if (controller) {
          // Watch the model for programmatic changes
          controller.$render = function () {
            if (isSelect) {
              elm.select2('val', controller.$modelValue);
            } else {
              if (isMultiple && !controller.$modelValue) {
                elm.select2('data', []);
              } else if (angular.isObject(controller.$modelValue)) {
                elm.select2('data', controller.$modelValue);
              } else {
                elm.select2('val', controller.$modelValue);
              }
            }
          };


          // Watch the options dataset for changes
          if (watch) {
            scope.$watch(watch, function (newVal, oldVal, scope) {
              if (!newVal) return;
              // Delayed so that the options have time to be rendered
              setTimeout(function () {
                elm.select2('val', controller.$viewValue);
                // Refresh angular to remove the superfluous option
                elm.trigger('change');
              });
            });
          }

          if (!isSelect) {
            // Set the view and model value and update the angular template manually for the ajax/multiple select2.
            elm.bind("change", function () {
              scope.$apply(function () {
                controller.$setViewValue(elm.select2('data'));
              });
            });

            if (opts.initSelection) {
              var initSelection = opts.initSelection;
              opts.initSelection = function (element, callback) {
                initSelection(element, function (value) {
                  controller.$setViewValue(value);
                  callback(value);
                });
              };
            }
          }
        }

        attrs.$observe('disabled', function (value) {
          elm.select2(value && 'disable' || 'enable');
        });

        if (attrs.ngMultiple) {
          scope.$watch(attrs.ngMultiple, function(newVal) {
            elm.select2(opts);
          });
        }

        // Set initial value since Angular doesn't
        elm.val(scope.$eval(attrs.ngModel));

        // Initialize the plugin late so that the injected DOM does not disrupt the template compiler
        setTimeout(function () {
          elm.select2(opts);
        });
      };
    }
  };
}]);

/**
 * uiShow Directive
 *
 * Adds a 'ui-show' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
angular.module('ui.directives').directive('uiShow', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiShow, function (newVal, oldVal) {
      if (newVal) {
        elm.addClass('ui-show');
      } else {
        elm.removeClass('ui-show');
      }
    });
  };
}])

/**
 * uiHide Directive
 *
 * Adds a 'ui-hide' class to the element instead of display:block
 * Created to allow tighter control  of CSS without bulkier directives
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
  .directive('uiHide', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiHide, function (newVal, oldVal) {
      if (newVal) {
        elm.addClass('ui-hide');
      } else {
        elm.removeClass('ui-hide');
      }
    });
  };
}])

/**
 * uiToggle Directive
 *
 * Adds a class 'ui-show' if true, and a 'ui-hide' if false to the element instead of display:block/display:none
 * Created to allow tighter control  of CSS without bulkier directives. This also allows you to override the
 * default visibility of the element using either class.
 *
 * @param expression {boolean} evaluated expression to determine if the class should be added
 */
  .directive('uiToggle', [function () {
  return function (scope, elm, attrs) {
    scope.$watch(attrs.uiToggle, function (newVal, oldVal) {
      if (newVal) {
        elm.removeClass('ui-hide').addClass('ui-show');
      } else {
        elm.removeClass('ui-show').addClass('ui-hide');
      }
    });
  };
}]);

/*
 jQuery UI Sortable plugin wrapper

 @param [ui-sortable] {object} Options to pass to $.fn.sortable() merged onto ui.config
*/

angular.module('ui.directives').directive('uiSortable', [
  'ui.config', function(uiConfig) {
    var options;
    options = {};
    if (uiConfig.sortable != null) {
      angular.extend(options, uiConfig.sortable);
    }
    return {
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var onStart, onUpdate, opts, _start, _update;
        opts = angular.extend({}, options, scope.$eval(attrs.uiOptions));
        if (ngModel != null) {
          onStart = function(e, ui) {
            return ui.item.data('ui-sortable-start', ui.item.index());
          };
          onUpdate = function(e, ui) {
            var end, start;
            start = ui.item.data('ui-sortable-start');
            end = ui.item.index();
            ngModel.$modelValue.splice(end, 0, ngModel.$modelValue.splice(start, 1)[0]);
            return scope.$apply();
          };
          _start = opts.start;
          opts.start = function(e, ui) {
            onStart(e, ui);
            if (typeof _start === "function") {
              _start(e, ui);
            }
            return scope.$apply();
          };
          _update = opts.update;
          opts.update = function(e, ui) {
            onUpdate(e, ui);
            if (typeof _update === "function") {
              _update(e, ui);
            }
            return scope.$apply();
          };
        }
        return element.sortable(opts);
      }
    };
  }
]);

/**
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.directives').directive('uiTinymce', ['ui.config', function (uiConfig) {
  uiConfig.tinymce = uiConfig.tinymce || {};
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ngModel) {
      var expression,
        options = {
          // Update model on button click
          onchange_callback: function (inst) {
            if (inst.isDirty()) {
              inst.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
          },
          // Update model on keypress
          handle_event_callback: function (e) {
            if (this.isDirty()) {
              this.save();
              ngModel.$setViewValue(elm.val());
              if (!scope.$$phase)
                scope.$apply();
            }
            return true; // Continue handling
          },
          // Update model when calling setContent (such as from the source editor popup)
          setup: function (ed) {
            ed.onSetContent.add(function (ed, o) {
              if (ed.isDirty()) {
                ed.save();
                ngModel.$setViewValue(elm.val());
                if (!scope.$$phase)
                  scope.$apply();
              }
            });
          }
        };
      if (attrs.uiTinymce) {
        expression = scope.$eval(attrs.uiTinymce);
      } else {
        expression = {};
      }
      angular.extend(options, uiConfig.tinymce, expression);
      setTimeout(function () {
        elm.tinymce(options);
      });
    }
  };
}]);

/**
 * General-purpose validator for ngModel.
 * angular.js comes with several built-in validation mechanism for input fields (ngRequired, ngPattern etc.) but using
 * an arbitrary validation function requires creation of a custom formatters and / or parsers.
 * The ui-validate directive makes it easy to use any function(s) defined in scope as a validator function(s).
 * A validator function will trigger validation on both model and input changes.
 *
 * @example <input ui-validate="myValidatorFunction">
 * @example <input ui-validate="{foo : validateFoo, bar : validateBar}">
 *
 * @param ui-validate {string|object literal} If strings is passed it should be a scope's function to be used as a validator.
 * If an object literal is passed a key denotes a validation error key while a value should be a validator function.
 * In both cases validator function should take a value to validate as its argument and should return true/false indicating a validation result.
 */
angular.module('ui.directives').directive('uiValidate', function () {

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {

      var validateFn, validateExpr = attrs.uiValidate;

      validateExpr = scope.$eval(validateExpr);
      if (!validateExpr) {
        return;
      }

      if (angular.isFunction(validateExpr)) {
        validateExpr = { validator: validateExpr };
      }

      angular.forEach(validateExpr, function (validatorFn, key) {
        validateFn = function (valueToValidate) {
          if (validatorFn(valueToValidate)) {
            ctrl.$setValidity(key, true);
            return valueToValidate;
          } else {
            ctrl.$setValidity(key, false);
            return undefined;
          }
        };
        ctrl.$formatters.push(validateFn);
        ctrl.$parsers.push(validateFn);
      });
    }
  };
});

/**
 * A replacement utility for internationalization very similar to sprintf.
 *
 * @param replace {mixed} The tokens to replace depends on type
 *  string: all instances of $0 will be replaced
 *  array: each instance of $0, $1, $2 etc. will be placed with each array item in corresponding order
 *  object: all attributes will be iterated through, with :key being replaced with its corresponding value
 * @return string
 *
 * @example: 'Hello :name, how are you :day'.format({ name:'John', day:'Today' })
 * @example: 'Records $0 to $1 out of $2 total'.format(['10', '20', '3000'])
 * @example: '$0 agrees to all mentions $0 makes in the event that $0 hits a tree while $0 is driving drunk'.format('Bob')
 */
angular.module('ui.filters').filter('format', function(){
  return function(value, replace) {
    if (!value) {
      return value;
    }
    var target = value.toString(), token;
    if (replace === undefined) {
      return target;
    }
    if (!angular.isArray(replace) && !angular.isObject(replace)) {
      return target.split('$0').join(replace);
    }
    token = angular.isArray(replace) && '$' || ':';

    angular.forEach(replace, function(value, key){
      target = target.split(token+key).join(value);
    });
    return target;
  };
});

/**
 * Wraps the
 * @param text {string} haystack to search through
 * @param search {string} needle to search for
 * @param [caseSensitive] {boolean} optional boolean to use case-sensitive searching
 */
angular.module('ui.filters').filter('highlight', function () {
  return function (text, search, caseSensitive) {
    if (search || angular.isNumber(search)) {
      text = text.toString();
      search = search.toString();
      if (caseSensitive) {
        return text.split(search).join('<span class="ui-match">' + search + '</span>');
      } else {
        return text.replace(new RegExp(search, 'gi'), '<span class="ui-match">$&</span>');
      }
    } else {
      return text;
    }
  };
});

/**
 * Converts variable-esque naming conventions to something presentational, capitalized words separated by space.
 * @param {String} value The value to be parsed and prettified.
 * @param {String} [inflector] The inflector to use. Default: humanize.
 * @return {String}
 * @example {{ 'Here Is my_phoneNumber' | inflector:'humanize' }} => Here Is My Phone Number
 *          {{ 'Here Is my_phoneNumber' | inflector:'underscore' }} => here_is_my_phone_number
 *          {{ 'Here Is my_phoneNumber' | inflector:'variable' }} => hereIsMyPhoneNumber
 */
angular.module('ui.filters').filter('inflector', function () {
  function ucwords(text) {
    return text.replace(/^([a-z])|\s+([a-z])/g, function ($1) {
      return $1.toUpperCase();
    });
  }

  function breakup(text, separator) {
    return text.replace(/[A-Z]/g, function (match) {
      return separator + match;
    });
  }

  var inflectors = {
    humanize: function (value) {
      return ucwords(breakup(value, ' ').split('_').join(' '));
    },
    underscore: function (value) {
      return value.substr(0, 1).toLowerCase() + breakup(value.substr(1), '_').toLowerCase().split(' ').join('_');
    },
    variable: function (value) {
      value = value.substr(0, 1).toLowerCase() + ucwords(value.split('_').join(' ')).substr(1).split(' ').join('');
      return value;
    }
  };

  return function (text, inflector, separator) {
    if (inflector !== false && angular.isString(text)) {
      inflector = inflector || 'humanize';
      return inflectors[inflector](text);
    } else {
      return text;
    }
  };
});

/**
 * Filters out all duplicate items from an array by checking the specified key
 * @param [key] {string} the name of the attribute of each object to compare for uniqueness
 if the key is empty, the entire object will be compared
 if the key === false then no filtering will be performed
 * @return {array}
 */
angular.module('ui.filters').filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});
