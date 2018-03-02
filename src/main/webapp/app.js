'use strict';

var ngApp = angular.module('GroupDocsViewer', ['ngMaterial', 'ngResource']);
ngApp.value('FilePath', DefaultFilePath);
ngApp.value('tabselectedIndex', 0);
ngApp.value('isImage', isImageToggle);
ngApp.value('Rotate', RotateAngel);

ZoomValue = (ZoomValue > 10 ? ZoomValue / 100 : ZoomValue);
ZoomValue = (ZoomValue <= 0.05 ? 0.05 : ZoomValue);
ZoomValue = (ZoomValue >= 6 ? 6 : ZoomValue);
ZoomValue = parseFloat(ZoomValue);

ngApp.value('Zoom', ZoomValue);
ngApp.value('TotalPages', TotalDocumentPages);
ngApp.value('CurrentPage', 1);
ngApp.value('Watermark', {
    Text: (ShowWatermark ? WatermarkText : ""),
    Color: WatermarkColor,
    Position: WatermarkPosition,
    Width: WatermarkWidth,
    Opacity: WatermarkOpacity
});

ngApp.value('ShowHideTools', {
    IsFileSelection: !ShowFileSelection,
    IsShowWatermark: !ShowWatermark,
    IsShowImageToggle: !ShowImageToggle,
    IsThubmnailPanel: !ShowThubmnailPanel,
    IsShowZooming: !ShowZooming,
    IsShowRotateImage: !ShowRotateImage,
    IsShowPagingPanel: !ShowPagingPanel,
    IsShowDownloads: !ShowDownloads,
    IsShowPrint: !ShowPrint
});

ngApp.factory('FilesFactory', function ($resource) {
    return $resource('/files', {}, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
});

ngApp.factory('DocumentPagesFactory', function ($resource) {
    return $resource('/document/info?file=:filename', {}, {
        query: {
            method: 'GET',
            isArray: false
        }
    });
});

ngApp.controller('ToolbarController', function ToolbarController($rootScope, $scope, $http, $window, $mdSidenav, isImage, Zoom, TotalPages, CurrentPage, Watermark, ShowHideTools, FilePath, $mdDialog, FilesFactory, tabselectedIndex) {

    $rootScope.tabselectedIndex = tabselectedIndex;
    $scope.showTabDialog = function (ev) {
        $mdDialog.show({
            controller: DialogController,
            contentElement: '#fuDialog',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        })
            .then(function (answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function () {
                $scope.status = 'You cancelled the dialog.';
            });
    };

    function DialogController($scope, $mdDialog) {
        $scope.hide = function () {
            $mdDialog.hide();
        };
        $scope.cancel = function () {
            $mdDialog.cancel();
        };
        $scope.answer = function (answer) {
            $mdDialog.hide(answer);
        };
    };

    $scope.getFileDetails = function (e) {

        $scope.files = [];
        $scope.$apply(function () {
            for (var i = 0; i < e.files.length; i++) {
                $scope.files.push(e.files[i])
            }

        });
    };

    $scope.uploadFiles = function () {
        var data = new FormData();

        if ($scope.files != undefined) {

            for (var i in $scope.files) {
                data.append("uploadedfile", $scope.files[i]);
            }
            var objXhr = new XMLHttpRequest();
            objXhr.addEventListener("progress", updateProgress, false);
            objXhr.addEventListener("load", transferComplete, false);

            objXhr.open("POST", "/upload/file");
            objXhr.send(data);
            document.getElementById('progress').style.display = 'block';
            $scope.files = undefined;
        }
        else {
            alert("Please select file to upload.");
        }
    };

    function updateProgress(e) {
        if (e.lengthComputable) {
            document.getElementById('progress').style.display = 'block';
            document.getElementById('progress').setAttribute('max', e.total);
        }
    };

    function transferComplete(e) {
        $rootScope.list = FilesFactory.query();
        alert("Files uploaded successfully.");
        document.getElementById('progress').style.display = 'none';
        $rootScope.tabselectedIndex = 1;
    };

    $scope.uploadedFile = {};
    $scope.uploadedFile.name = "";

    $scope.toggleLeft = function () {
        $mdSidenav('left').toggle().then(function () {
            $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
        });
    };

    $scope.openMenu = function ($mdOpenMenu, ev) {
        $mdOpenMenu(ev);
    };

    $scope.Zoom = ZoomValue;

    $scope.TotalPages = TotalDocumentPages;
    $scope.CurrentPage = CurrentPage;

    $scope.Watermark = {
        Text: Watermark.Text,
        Color: Watermark.Color,
        Position: Watermark.Position,
        Width: Watermark.Width,
        Opacity: Watermark.Opacity
    };

    $scope.ShowHideTools = {
        IsShowWatermark: ShowHideTools.IsShowWatermark,
        IsFileSelection: ShowHideTools.IsFileSelection,
        IsShowImageToggle: ShowHideTools.IsShowImageToggle,
        IsThubmnailPanel: ShowHideTools.IsThubmnailPanel,
        IsShowZooming: ShowHideTools.IsShowZooming,
        IsShowRotateImage: ShowHideTools.IsShowRotateImage,
        IsShowPagingPanel: ShowHideTools.IsShowPagingPanel,
        IsShowDownloads: ShowHideTools.IsShowDownloads,
        IsShowPrint: ShowHideTools.IsShowPrint
    };

    $scope.isImage = isImage;

    $scope.$on('selected-file-changed', function ($event, selectedFile) {
        $rootScope.selectedFile = selectedFile;
        DefaultFilePath = selectedFile;
    });

    $scope.rotateDocument = function () {
        $rootScope.$broadcast('rotate-file', $rootScope.selectedFile);
    };

    $scope.selected = false;

    $scope.zoomInDocument = function () {
        ZoomValue = (ZoomValue > 10 ? ZoomValue / 100 : ZoomValue);
        ZoomValue = (ZoomValue <= 0 ? 0.05 : ZoomValue);
        ZoomValue = parseFloat(ZoomValue);
        ZoomValue += 0.25;
        Zoom = ZoomValue;
        if ($scope.isImage)
            $rootScope.$broadcast('zin-file', $rootScope.selectedFile);
        else
            resizeIFrame();
    };

    $scope.zoomOutDocument = function () {
        ZoomValue = (ZoomValue > 10 ? ZoomValue / 100 : ZoomValue);
        ZoomValue = (ZoomValue <= 0 ? 0.05 : ZoomValue);
        ZoomValue = parseFloat(ZoomValue);
        ZoomValue -= 0.25;
        Zoom = ZoomValue;
        if ($scope.isImage)
            $rootScope.$broadcast('zout-file', $rootScope.selectedFile);
        else
            resizeIFrame();
    };

    $scope.zoomLevels = function (selectedzoomlevel) {
        ZoomValue = parseFloat(selectedzoomlevel);
        Zoom = ZoomValue;
        if ($scope.isImage)
            $rootScope.$broadcast('zin-file', $rootScope.selectedFile);
        else
            resizeIFrame();
    }

    $scope.togelToImageDocument = function () {
        $rootScope.$broadcast('toggle-file', $rootScope.selectedFile);
        isImageToggle = !$scope.isImage;
        resizeIFrame();
        $scope.isImage = !$scope.isImage;
    };

    $scope.onSwitchChange = function (cbState) {
        $rootScope.$broadcast('toggle-file', $rootScope.selectedFile);
        isImageToggle = !$scope.isImage;
        resizeIFrame();
        $scope.isImage = !$scope.isImage;
    };

    $scope.nextDocument = function () {
        if ($rootScope.list.indexOf($rootScope.selectedFile) + 1 == $rootScope.list.length) {
            $rootScope.$broadcast('selected-file-changed', $rootScope.list[0]);
        }
        else {
            $rootScope.$broadcast('selected-file-changed', $rootScope.list[$rootScope.list.indexOf($rootScope.selectedFile) + 1]);
        }
    };

    $scope.nextSearch = function () {
        NavigateNextSearch();
    };

    $scope.previousSearch = function () {
        NavigatePreviousSearch();
    };

    $scope.previousDocument = function () {
        if ($rootScope.list.indexOf($rootScope.selectedFile) - 1 == -1) {
            $rootScope.$broadcast('selected-file-changed', $rootScope.list[$rootScope.list.length - 1]);
        }
        else {
            $rootScope.$broadcast('selected-file-changed', $rootScope.list[$rootScope.list.indexOf($rootScope.selectedFile) - 1]);
        }
    };

    $scope.navigatePage = function (options) {
        if ($rootScope.selectedFile) {
            TotalPages = parseInt(TotalDocumentPages);
            CurrentPage = parseInt(CurrentDocumentPage);

            if (options == '+') {
                CurrentPage += 1;
                if (CurrentPage > TotalPages) {
                    CurrentPage = TotalPages;
                }
                location.hash = 'page-view-' + CurrentPage;
            }
            else if (options == '-') {
                CurrentPage -= 1;

                if (CurrentPage < 1) {
                    CurrentPage = 1;
                }

                location.hash = 'page-view-' + CurrentPage;
            }
            else if (options == 'f') {
                CurrentPage = 1;
                location.hash = 'page-view-1';
            }
            else if (options == 'e') {
                CurrentPage = TotalPages;
                location.hash = 'page-view-' + TotalPages;
            }
            else {
                if (document.getElementById('inputcurrentpage').value != '')
                    CurrentPage = parseInt(document.getElementById('inputcurrentpage').value);
                if (CurrentPage > TotalPages) {
                    CurrentPage = TotalPages;
                }

                if (CurrentPage < 1) {
                    CurrentPage = 1;
                }

                location.hash = 'page-view-' + CurrentPage;
            }

            CurrentDocumentPage = parseInt(CurrentPage);
            UpdatePager();
        }
    };

    $scope.printPdf = function (isOriginal) {
        var watermarkText = Watermark.Text;
        if (isOriginal) {
            watermarkText = '';
        }
        var documentUrl = '/printable/html?file=' + $rootScope.selectedFile + '&watermarkText=' + watermarkText + '&watermarkColor=' + Watermark.Color + '&watermarkPosition=' + Watermark.Position + '&watermarkWidth=' + Watermark.Width + '&watermarkOpacity=' + Watermark.Opacity + '&isdownload=false';

        $http({
            method: 'GET',
            url: documentUrl
        }).then(function (success) {

            var printWindow = $window.open('', '_blank', '', '');
            if (printWindow) {
                printWindow.onload = function (e) {

                }

                printWindow.document.write(success.data);
                printWindow.print();
                printWindow.close();
            }
        }, function (error) {
            console.log('error: ' + error);
        });
    };

    $scope.navigateSearch = function () {
        if ($rootScope.selectedFile) {
            searchText();
        }
    };
});

ngApp.controller('ThumbnailsController',
    function ThumbnailsController($rootScope, $scope, $sce, $mdSidenav, DocumentPagesFactory, FilePath, Watermark, ShowHideTools, Rotate, Zoom) {
        $scope.isLeftSidenavVislble = false;
        if (FilePath) {
            $rootScope.selectedFile = FilePath;
            $scope.docInfo = DocumentPagesFactory.query({
                filename: FilePath
            });

        }
        $scope.$on('selected-file-changed', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            $scope.docInfo = DocumentPagesFactory.query({
                filename: selectedFile
            });
        });
        $scope.$on('md-sidenav-toggle-complete', function ($event, component) {
            $scope.isLeftSidenavVislble = component.isOpen();
        });


        $scope.onThumbnailClick = function ($event, item) {
            $mdSidenav('left').toggle().then(function () {
                $scope.CurrentPage = parseInt(item.number);
                CurrentDocumentPage = $scope.CurrentPage;
                UpdatePager();
                location.hash = 'page-view-' + item.number;
                $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
                $scope.selected = item;
            });
        };

        $scope.onAttachmentThumbnailClick = function ($event, name, number, attachment) {
            $mdSidenav('left').toggle().then(function () {
                $scope.CurrentPage = parseInt(number);
                CurrentDocumentPage = $scope.CurrentPage;
                UpdatePager();
                location.hash = 'page-view-' + number;
                $rootScope.$broadcast('md-sidenav-toggle-complete', $mdSidenav('left'));
                $scope.selected = attachment;
            });
        };
        $scope.createThumbnailUrl = function (selectedFile, itemNumber) {
            if ($scope.isLeftSidenavVislble) {
                return $sce.trustAsResourceUrl('/page/image?width=300&file=' + selectedFile
                    + '&page=' + itemNumber
                    + '&watermarkText=' + Watermark.Text
                    + '&watermarkColor=' + Watermark.Color
                    + '&watermarkPosition=' + Watermark.Position
                    + '&watermarkWidth=' + Watermark.Width
                    + '&watermarkOpacity=' + Watermark.Opacity
                    + '&rotate=' + Rotate
                    + '&zoom=' + parseInt(Zoom * 100));
            }
        };
        $scope.createAttachmentThumbnailPageUrl = function (selectedFile, attachment, itemNumber) {
            if ($scope.isLeftSidenavVislble) {
                return $sce.trustAsResourceUrl('/attachment/image?width=300&file=' + selectedFile
                    + '&attachment=' + attachment
                    + '&page=' + itemNumber
                    + '&watermarkText=' + Watermark.Text
                    + '&watermarkColor=' + Watermark.Color
                    + '&watermarkPosition=' + Watermark.Position
                    + '&watermarkWidth=' + Watermark.Width
                    + '&watermarkOpacity=' + Watermark.Opacity);
            }
        };

    }
);

ngApp.factory('PagesHtmlFactory', function ($resource, $rootScope, Watermark, FilePath) {
    return $resource('/page/html?file='
        + FilePath + '&page=' + 1
        + '&watermarkText=' + Watermark.Text
        + '&watermarkColor=' + Watermark.Color
        + '&watermarkPosition=' + Watermark.Position
        + '&watermarkWidth=' + Watermark.Width
        + '&watermarkOpacity=' + Watermark.Opacity, {
        query: {
            method: 'GET',
            isArray: true
        }
    });
});

ngApp.controller('PagesController',
    function PagesController($rootScope, $scope, $sce, $document, DocumentPagesFactory, FilePath, Watermark, ShowHideTools, isImage, Rotate, Zoom, PagesHtmlFactory) {
        if (FilePath) {
            $rootScope.selectedFile = FilePath;
            $scope.docInfo = DocumentPagesFactory.query({
                filename: FilePath
            });
            $scope.lstPagesHTML = PagesHtmlFactory.query();
        }

        $scope.$on('selected-file-changed', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            $scope.docInfo = DocumentPagesFactory.query({
                filename: selectedFile
            });
        });

        $scope.$on('rotate-file', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            if (Rotate <= 270)
                Rotate += 90;
            else
                Rotate = 0;
        });

        $scope.$on('zin-file', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            Zoom = ZoomValue;
        });

        $scope.$on('zout-file', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            Zoom = ZoomValue;
        });

        $scope.$on('toggle-file', function (event, selectedFile) {
            $rootScope.selectedFile = selectedFile;
            isImage = !isImage;
        });

        $scope.createPageUrl = function (selectedFile, itemNumber) {
            if (isImage) {
                return $sce.trustAsResourceUrl('/page/image?file='
                    + selectedFile + '&width=700&page=' + itemNumber
                    + '&watermarkText=' + Watermark.Text
                    + '&watermarkColor=' + Watermark.Color
                    + '&watermarkPosition=' + Watermark.Position
                    + '&watermarkWidth=' + Watermark.Width
                    + '&watermarkOpacity=' + Watermark.Opacity
                    + '&rotate=' + Rotate
                    + '&zoom=' + parseInt(Zoom * 100));
            }
            else {
                return $sce.trustAsResourceUrl('/page/html?file='
                    + selectedFile + '&page=' + itemNumber
                    + '&watermarkText=' + Watermark.Text
                    + '&watermarkColor=' + Watermark.Color
                    + '&watermarkPosition=' + Watermark.Position
                    + '&watermarkWidth=' + Watermark.Width
                    + '&watermarkOpacity=' + Watermark.Opacity);
            }
        };

        $scope.createAttachmentPageUrl = function (selectedFile, attachmentName, itemNumber) {
            return $sce.trustAsResourceUrl('/attachment/html?file=' + selectedFile
                + '&attachment=' + attachmentName
                + '&page=' + itemNumber
                + '&watermarkText=' + Watermark.Text
                + '&watermarkColor=' + Watermark.Color
                + '&watermarkPosition=' + Watermark.Position
                + '&watermarkWidth=' + Watermark.Width
                + '&watermarkOpacity=' + Watermark.Opacity);
        };
    }
);

ngApp.directive('iframeSetDimensionsOnload', [function () {
    return {
        restrict: 'A',
        link: function ($scope, element, attrs) {
            element.on('load', function () {
                ZoomValue = (ZoomValue > 10 ? ZoomValue / 100 : ZoomValue);
                ZoomValue = (ZoomValue <= 0.05 ? 0.05 : ZoomValue);
                ZoomValue = (ZoomValue >= 6 ? 6 : ZoomValue);

                var body = element[0].contentWindow.document.body,
                    html = element[0].contentWindow.document.documentElement,
                    height = Math.max(
                        body.scrollHeight,
                        body.offsetHeight,
                        html.clientHeight,
                        html.scrollHeight,
                        html.offsetHeight
                    );

                if (!EnableContextMenu)
                    element[0].contentWindow.document.body.setAttribute("oncontextmenu", "return false;");

                height = parseInt(height) + 50;

                if (!ShowWatermark)
                    element[0].contentWindow.document.body.style.cssText = "text-align: center !important;";

                if (isImageToggle)
                    element[0].contentWindow.document.body.style.cssText = "text-align: center !important;";

                element[0].style.cssText = "height:" + parseInt(height) + "px!important; width:100%!important; ";

                height = (height * (parseFloat(ZoomValue) < 1 ? 1 : parseFloat(ZoomValue)));
                height = parseInt(height);
                height = parseInt(height) + 10;

                if (ZoomValue > 1) {
                    element[0].style.cssText = "zoom: " + ZoomValue + "; -moz-transform: scale(" + ZoomValue + "); -moz-transform-origin: 0 0; -o-transform: scale(" + ZoomValue + "); -o-transform-origin: 0 0; -webkit-transform: scale(" + ZoomValue + "); -webkit-transform-origin: 0 0; height:" + height + "px !important; width:100%!important; overflow: visible !important;";
                }
                else {
                    element[0].style.cssText = "zoom: " + ZoomValue + "; -moz-transform: scale(" + ZoomValue + "); -o-transform: scale(" + ZoomValue + "); -webkit-transform: scale(" + ZoomValue + "); height:" + height + "px !important; width:100%!important; overflow: visible !important;";
                }

                var selectObj = document.getElementById('zoomselect');
                if (selectObj != undefined) {
                    for (var i = 0; i < selectObj.options.length; i++) {
                        if (selectObj.options[i].value == ZoomValue) {
                            selectObj.options[i].selected = true;
                        }
                    }
                }

                UpdatePager();
            });
        }
    }
}]);

ngApp.controller('AvailableFilesController', function AvailableFilesController($rootScope, $scope, FilesFactory, DocumentPagesFactory, FilePath, $mdDialog) {
    $rootScope.list = FilesFactory.query();

    $scope.onOpen = function () {
        $rootScope.list = FilesFactory.query();
    };

    $scope.onChange = function (item) {
        $mdDialog.hide();
        $rootScope.$broadcast('selected-file-changed', item);
    };

});

ngApp.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.myEnter);
                });
                event.preventDefault();
            }
        });
    };
});