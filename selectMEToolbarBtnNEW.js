//*****************************************************************************
// Copyright © 2018 Waters Corporation. All rights reserved.
//*****************************************************************************
'use strict';

angular.module('selectMEToolbarBtnModule', [])
.directive('watSelectMEToolbarBtn', [
        function() {
            return {
                restrict: 'E',
                scope: {},
                replace: true,
                templateUrl: 'modules/tools/methodEditor/client/views/selectMEFileBtnTemplate.html',
                controller: 'SelectMEToolbarBtn',
                link: function(scope, elem) {
                    elem.find('.cyclicXMLSelect').click(function() {
                        elem.find('input[type="file"]').click();
                    });
                }
            }
        }
    ])

    .controller('SelectMEToolbarBtn', ['$scope', 'fileReader', 'messageDlgModal','methodEditorService','modifiedService', 'keyValueStore', 'confirmationModal',
      function($scope, fileReader, messageDlgModal, methodEditorService, modifiedService, keyValueStore, confirmationModal) {

        //SR add file load error as in selectAcquisitionFileBtn.js

            // Use to toggle the file input element
            $scope.toggle = true;
          /////////////////////////////////////////////////////////////////////////////////////////
            var Room = keyValueStore.open('MassLynx');



            //$scope.progress = Room.get('MethodEditor.FileName', 'MassLynxCurrentMethodFile');
            var currentMethod = Room.asProto('MassLynxCurrentMethodFile').get('MethodEditor.FileName');
            $scope.isRunning = false;
            $scope.logText = '';

            var unbindStatusWatcher = $scope.$watch('currentMethod.MethodFile', function (newValue) {
                if (angular.isUndefined(newValue)) return;
                if (newValue != null) {
                    $scope.isRunning = true;
                    $scope.sendFile(newValue);
                }
                else {
                    $scope.isRunning = false;
                }
            });

            $scope.$on('$destroy', function () {
                unbindStatusWatcher();
            });

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
           $scope.load = function (file) {
                fileReader.readAsText(file, $scope)
                .then(function(result) {
                    var xml = result;
                    var errormsg = '';
                    var errormsg = methodEditorService.loadMethodXML(xml,file.name);
                    if (errormsg != '') {
                        messageDlgModal.error(errormsg);
                    }
                    else {
                        modifiedService.clear('methodEditor');
                    }
                })
            }

          
           
            $scope.sendFile = function(event) {
                //var sd = methodRoom.asProto('KeyValueStorePut').get('MethodEditor.Filename');
                if (event.files.length > 0) {
                    var file = event.files[0];
                    var fileExtension=file.name.substr(file.name.lastIndexOf('.') + 1);
                    if (fileExtension === "xml") {
                        if (modifiedService.isModified('methodEditor')) {//confirm overwrite if changes made to current method
                            var modalInstance = confirmationModal.open('CONFIRMATION_DIALOG_TITLE', 'OVERWRITE_CONFIRM_MSG_ID', true);
                            modalInstance.result.then(function(selectedOption) {
                                if (selectedOption == 'yes') {
                                    $scope.load(file);
                                }
                            })
                        }
                        else {
                            $scope.load(file);
                        }
                    }
                    else {
                        messageDlgModal.error('only .xml files can be selected');
                    }
                }
                else {
      //              $log.warn('No file selected!!');
                }
                // Toggle which file input element we're using
                // This is to support loading the same file multiple times!!
                $scope.toggle = !$scope.toggle;
            };
        }
    ]);