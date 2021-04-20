"use strict";

/* UINamespace 샘플 확장
 *
 *이 샘플 확장은 UI 네임 스페이스를 사용하는 방법을 보여줍니다.
 * 사용자가 상호 작용할 수있는 추가 UI가있는 팝업 대화 상자를 만듭니다.
 *이 대화 상자의 내용은 실제로 확장입니다 (
 * 자세한 내용은 uiNamespaceDialog.js 참조).
 *
 *이 샘플은 백그라운드에서 데이터 소스를 자동으로 새로 고치는 확장 프로그램입니다.
 * 대시 보드. 확장 프로그램은 대시 보드 공간을 많이 차지할 필요가 거의 없습니다.
 * 사용자가 설정을 조정해야 할 때 UI 네임 스페이스가 사용됩니다.
 */

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
    const defaultIntervalInMin = "5";
    let activeDatasourceIdList = [];

    $(document).ready(function () {
        // 확장을 초기화 할 때 특수 ID를 매핑하는 선택적 개체가 전달됩니다.
        // 'configure'여야 함)을 함수에 추가합니다. 이것은 올바른 컨텍스트 메뉴 추가와 함께
        // 항목을 매니페스트에 추가하면 확장 영역에 새 "구성 ..."컨텍스트 메뉴 항목이 추가됩니다.
        // 대시 보드 내부. 사용자가 컨텍스트 메뉴 항목을 클릭하면 함수가 전달됩니다.
        // 여기서 실행됩니다.
        $("#configureBtn").on("click", function () {
            configure();
        });
        tableau.extensions.initializeAsync({ configure: configure }).then(function () {
            //이 이벤트를 사용하면 상위 확장 및 팝업 확장이
            // 설정 동기화. 이 이벤트는 설정이있을 때마다 트리거됩니다.
            // 부모 또는 팝업에서이 확장에 대해 변경되었습니다 (예 : settings.saveAsync가 호출 될 때).
            // tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
            //     updateExtensionBasedOnSettings(settingsEvent.newSettings);
            // });

            if (tableau.extensions.settings.get("sendDataKey") != null) {
                var sendData2 = JSON.parse(tableau.extensions.settings.get("sendDataKey"));

                render(sendData2);
            }

            // $("#savedText").text("asdf" + tableau.extensions.settings.get("sendDataKey"));
        });
    });

    function configure() {
        // 이것은 window.location.origin 속성을 사용하여 체계, 호스트 이름 및
        // 부모 확장이 현재 실행중인 포트이므로이 문자열에는
        // 확장이 새 위치에 배포 된 경우 업데이트됩니다.
        const popupUrl = `${window.location.origin}/Samples/test/testDialog.html`;

        /**
         * 실제로 사용자에게 팝업 확장을 표시하는 API 호출입니다. 그만큼
         * 팝업은 항상 모달 대화 상자입니다. 유일한 필수 매개 변수는 팝업의 URL입니다.
         * 부모 확장과 동일한 도메인, 포트 및 체계 여야합니다.
         *
         * 개발자는 옵션을 전달하여 확장의 초기 크기를 제어 할 수 있습니다.
         * 높이 및 너비 속성을 가진 개체. 개발자는 또한 문자열을
         * 팝업 확장에 대한 '초기'페이로드. 이 페이로드는 즉시 사용할 수 있습니다.
         * 팝업 확장. 이 예에서는 '5'값이 전달되어
         * 기본 새로 고침 간격.
         */
        tableau.extensions.ui
            .displayDialogAsync(popupUrl, defaultIntervalInMin, { height: 700, width: 470 })
            .then((closePayload) => {
                //promise는 대화 상자가 예상대로 닫혔을 때 해결됩니다.
                // 팝업 확장은 tableau.extensions.ui.closeDialog를 호출했습니다.
                $("#inactive").hide();
                $("#active").show();

                console.log("senddata", tableau.extensions.settings.get("sendDataKey"));
                var sendData = JSON.parse(tableau.extensions.settings.get("sendDataKey"));

                render(sendData);
                // 닫기 페이로드는 closeDialog 메서드를 통해 팝업 확장에서 반환됩니다.
                // $("#sheetname").text(closePayload);
                // setupRefreshInterval(closePayload);
                //  After initialization, ask Tableau what sheets are available
            })
            .catch((error) => {
                // 예상되는 오류 조건 중 하나는 사용자가 팝업을 닫을 때입니다 (즉,
                // 대화 상자의 오른쪽 상단에있는 'X'를 클릭). 다음과 같이 확인할 수 있습니다.
                switch (error.errorCode) {
                    case tableau.ErrorCodes.DialogClosedByUser:
                        console.log("Dialog was closed by user");
                        break;
                    default:
                        console.error(error.message);
                }
            });
    }

    function render(sendData) {
        $("#inactive").hide();
        $("#active").show();
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        // Find a specific worksheet
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === sendData.sheetname;
        });
        // let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
        // unregisterHandlerFunctions.push(unregisterHandlerFunction);
        // console.log(unregisterHandlerFunction);

        $("#getdata").on("click", function () {
            worksheet.getSummaryDataAsync().then(function (sumdata) {
                const worksheetData = sumdata;
                console.log(worksheetData);
                var i = 0;

                for (i = 0; i < worksheetData.columns.length; i++) {
                    if (worksheetData.columns[i].fieldName == sendData.colname) {
                        console.log("columns에서 userid가 있는쪽 번호는", i);
                        console.log(worksheetData.columns[i]);
                        break;
                    }
                }
                var k = 0;
                var fiveArr = [];
                for (k = 0; k < worksheetData.data.length; k++) {
                    fiveArr.push(worksheetData.data[k][i].formattedValue);
                }
                fiveArr = new Set(fiveArr);
                fiveArr = [...fiveArr];
                console.log(fiveArr);
                $("#colnames").text(i + "번째");

                $("#sheetname").text(JSON.stringify(fiveArr));
                var receiversList = [
                    {
                        phone: "010-5030-1826",
                        아이디: "new1",
                        적립금: 0,
                    },
                ];
                MessageAPI.openMessaging(receiversList);

                // $("#sheetname").text(JSON.stringify(worksheetData.data));
            });
        });
    }
})();

// columns에서 userid1이라는 객체만 뽑아보기
//각각의 5번 가져오기
