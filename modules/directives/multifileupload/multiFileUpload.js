/**
Uses a $scope.$on('uiMultiFileUploadGo', {instId:xxx, files:[{file:xx}, {file:yy}]}) to initiate uploading one or more files and displays progress (bar). The server response is passed back via a callback function.

//TOC
1. init
2. $scope.$on('uiMultiFileUploadGo',..
4. $scope.uploadFile =function
5. function uploadProgress
6. function uploadComplete
6.25. function ajaxUploadComplete
6.5. function afterComplete
7. function uploadFailed
8. function uploadCanceled


scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html)
@param {Object} opts
	@param {String} instId Unique identifer for this instance - used for triggering the $scope.$on to initiate the upload
	// @param {Array} files Array of files to upload	//UPDATE: these will be passed in on each $scope.$on
	@param {String} uploadPath Path to upload file to (backend script)
	@param {Object} [serverParamNames] Form names to submit (so can interact with any server).
		@param {String} [files ='files'] The key to use for passing back the files. This will be an array of files.
	@param {Object} [otherData] Key pairs of additional data to send to backend with the request (i.e. {type: 'image'})
@param {Function} uploadComplete Function to call after successful upload (all data from server will be passed back as is

attrs


@usage:
partial / html:
<div ui-multi-file-upload opts='opts' upload-complete='uploadComplete' ></div>

controller / js:
$scope.opts ={
	instId: 'yes',
	// files:[
		// document.getElementById('file1').value
	// ],
	uploadPath: '/api/image/upload'
};

$scope.uploadComplete =function(data, params) {
	//do something here
};

//call this function to start the upload
function startUpload() {
	//trigger the upload to start
	$scope.$broadcast('uiMultiFileUploadGo', {instId: $scope.opts.instId, files:[{file:xx}, {file:yy}]});
}

//end: EXAMPLE usage
*/

// 'use strict';

angular.module('ui.directives').directive('uiMultiFileUpload', [function () {
  return {
		restrict: 'A',
		scope: {
			opts: '=',
			uploadComplete: '&'
		},

		compile: function(element, attrs) {
			var defaults ={
				showProgress:true
			};
			var xx;
			// attrs =angular.extend(defaults, attrs);		//doesn't work.. attrs.id is undefined
			for(xx in defaults) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaults[xx];
				}
			}
			
			if(attrs.id ===undefined) {		//would use scope.opts.instId but don't have access to scope yet..
				attrs.id ="uiMultiFileUpload"+Math.random().toString(36).substring(7);
			}
			var id1 =attrs.id;
			var ids ={
				'progress':{
					'barInner':id1+"ProgressBarInner",
					'bar':id1+"ProgressBar"
				}
			};
			attrs.ids =ids;		//save for later
			
			var html ="<div>"+
				"<div id='"+attrs.ids.progress.bar+"' class='ui-multi-file-upload-progress-bar'><div id='"+attrs.ids.progress.barInner+"' class='ui-multi-file-upload-progress-bar-inner'>&nbsp;</div></div>"+
				"<div>{{progressNumber}}</div>"+
				// "<div>{{fileInfo.name}}</div>"+
				// "<div>{{fileInfo.size}}</div>"+
				// "<div>{{fileInfo.type}}</div>"+
			"</div>";
			element.replaceWith(html);
		},
		
		controller: function($scope, $element, $attrs) {
			var defaultOpts ={
				serverParamNames:{
					files: 'files'
				}
			};
			$scope.opts =angular.extend(defaultOpts, $scope.opts);
				
			/**
			@toc 1.
			@method init
			*/
			function init(params) {
				// $scope.uploadFiles({});
			}
			
			/**
			@toc 2.
			$scope.$on('uiMultiFileUploadGo',..
			@param {Object} params
				@param {String} instId
				@param {Array} files Array of objects with at least a 'file' key for the files to upload (should be an array of local file names OR file data). Each item is an object of:
					@param {String|File} file The file to upload
					// @param {String} fileInputId The string of the input element where the file is (will put it's value)
			*/
			$scope.$on('uiMultiFileUploadGo', function(evt, params) {
				if($scope.opts.instId !==undefined && params.instId !==undefined && $scope.opts.instId ==params.instId) {		//only update if the correct instance
					if(params.files.length >0) {
						$scope.uploadFiles({files: params.files});
					}
					else {
						console.log('multiFileUpload: no files selected');
					}
				}
			});
			
			/**
			@toc 4.
			@method $scope.uploadFiles
			@param {Object} params
				@param {Array} files Array of objects with at least a 'file' key for the files to upload (should be an array of local file names OR file data). Each item is an object of:
					@param {String|File} file The file to upload
					// @param {String} fileInputId The string of the input element where the file is (will put it's value)
			*/
			$scope.uploadFiles =function(params) {
				angular.element(document.getElementById($attrs.ids.progress.barInner)).css({'width':'0%'});
				if($attrs.showProgress) {
					var eleProgressBar =angular.element(document.getElementById($attrs.ids.progress.bar));
					eleProgressBar.removeClass('complete');
					eleProgressBar.addClass('loading');
				}
				else {
					//LLoading.show({});		//@todo
				}
				
				var fd = new FormData();
				//add files data
				var ii;
				for(ii =0; ii<params.files.length; ii++) {
					fd.append($scope.opts.serverParamNames.files+'['+ii+']', params.files[ii].file);
				}
				
				//add other data (if any)
				if($scope.opts.otherData !==undefined) {
					var xx;
					for(xx in $scope.opts.otherData) {
						fd.append(xx, $scope.opts.otherData[xx]);
					}
				}
				
				var xhr = new XMLHttpRequest();
				if($attrs.showProgress) {
					xhr.upload.addEventListener("progress", uploadProgress, false);
				}
				xhr.onload =function(ee){uploadComplete(ee, params); };
				//xhr.addEventListener("load", uploadComplete, false);
				xhr.onerror =function(ee){uploadFailed(ee, params); };		//doesn't seem to work..
				//xhr.addEventListener("error", uploadFailed, false);		//doesn't seem to work..
				xhr.addEventListener("abort", uploadCanceled, false);
				xhr.open("POST", $scope.opts.uploadPath);
				xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
				xhr.onreadystatechange =function(){
					if(xhr.readyState ==4 && xhr.status !=200)
					{
						uploadFailed('', params);
					}
				};
				xhr.send(fd);
			};
			
			/**
			@toc 5.
			@method uploadProgress
			*/
			function uploadProgress(evt) {
				if (evt.lengthComputable) {
					var percentComplete = Math.round(evt.loaded * 100 / evt.total);
					$scope.progressNumber =percentComplete.toString() + '%';
					document.getElementById($attrs.ids.progress.barInner).style.width = percentComplete.toString() +'%';
				}
				else {
					$scope.progressNumber = 'unable to compute';
				}
			}
			
			/**
			@toc 6.
			@method uploadComplete
			@param params
				callback =array {'evtName':string, 'args':[]}
				uploadFileSimple =boolean true if no display
			*/
			function uploadComplete(evt, params) {
				/* This event is raised when the server send back a response */
				//alert(evt.target.responseText);
				
				document.getElementById($attrs.ids.progress.barInner).style.width = '100%';
				
				var ele1 =angular.element(document.getElementById($attrs.ids.progress.bar));
				ele1.addClass('complete');
				
				$scope.progressNumber ='';

				var data =$.parseJSON(evt.target.responseText);
				afterComplete(params, data);
			}
			
			/**
			@toc 6.25.
			@method ajaxUploadComplete
			*/
			function ajaxUploadComplete(params, data) {
				if(typeof(data) =='string') {
					data =$.parseJSON(data);
				}
				afterComplete(params, data);
			}
			
			/**
			@toc 6.5.
			@method afterComplete
			*/
			function afterComplete(params, data) {
				//call callback function passed in (if exists)
				if($scope.uploadComplete !==undefined && $scope.uploadComplete() !==undefined && typeof($scope.uploadComplete()) =='function') {		//this is an optional scope attr so don't assume it exists
					$scope.uploadComplete()(data, params);
				}
				
				//ensure back in angular world so events fire now
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			/**
			@toc 7.
			@method uploadFailed
			*/
			function uploadFailed(evt) {
				alert("There was an error attempting to upload the file. Please try again or try a different file.");
				//LLoading.close({});
			}

			/**
			@toc 8.
			@method uploadCanceled
			*/
			function uploadCanceled(evt) {
				alert("The upload has been canceled by the user or the browser dropped the connection.");
				//LLoading.close({});
			}
		}
	};
}]);