/**

@toc

scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)

attrs
	@param {String} iconClass Class to give to left side of button (this should refer to a CSS class that shows an image)
	@param {String} buttonText Text to show on the right side of the button

EXAMPLE usage:
partial / html:
<div ui-iconbutton icon-class='my-icon' button-text='Button Text!'></div>

controller / js:

//end: EXAMPLE usage
*/
angular.module('ui.directives').directive('uiIconbutton', ['ui.config', function (uiConfig) {
  return {
		restrict: 'A',
		link: function(scope, element, attrs) {
			element.addClass('ui-iconbutton clearfix');
			var htmlText ="<div class='ui-iconbutton-icon "+attrs.iconClass+"'></div>"+
				"<div class='ui-iconbutton-text'>"+attrs.buttonText+"</div>";
			element.html(htmlText);
		}
	};
}])
;