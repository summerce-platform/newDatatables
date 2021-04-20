"use strict";

/**
 * UINamespace 샘플 확장
 *
 * 이것은 UINamespace 샘플의 팝업 확장 부분입니다.
 * uiNamespace.js 외에 컨텍스트를 위해. 이 확장은
 * 사용자의 구성 설정 수집 및 통신 담당
 * 그 정보는 부모 확장으로 돌아갑니다.
 *
 *이 샘플은 이를 수행하는 두 가지 방법을 보여줍니다.
 * 1) 제안되고 가장 일반적인 방법은 정보를 저장하는 것입니다.
 * 설정 네임 스페이스를 통해. 부모는 다음과 같은 경우 알림을 구독 할 수 있습니다.
 * 설정이 업데이트되고 그에 따라 새로운 정보가 수집됩니다.
 * 2) 팝업 확장은 오픈을 통해 문자열 페이로드를 수신하고 보낼 수 있습니다.
 * initializeDialogAsync 및 closeDialog 메서드의 페이로드를 닫습니다. 이것은 유용합니다
 * 설정에 유지할 필요가없는 정보.
 */

// 전역 네임 스페이스를 오염시키지 않도록 모든 것을 익명 함수로 래핑합니다.
(function () {
    /**
     *이 확장은 사용자가 관심있는 각 데이터 소스의 ID를 수집합니다.
     * 팝업이 닫힐 때 설정에이 정보를 저장합니다.
     */
    const datasourcesSettingsKey = "selectedDatasources";
    let selectedDatasources = [];
    var mySheetName;
    var myColName;
    const worksheetnamekey = "selectedWorksheets";
    $(document).ready(function () {
        // 대시 보드의 확장과 확장의 유일한 차이점
        // 팝업에서 실행되는 것은 팝업 확장이 메소드를 사용해야한다는 것입니다.
        // 초기화를 위해 initializeAsync 대신 initializeDialogAsync.
        // 확장 기능 개발에는 영향을주지 않지만 내부적으로 사용됩니다.
        tableau.extensions.initializeDialogAsync().then(function (openPayload) {
            const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

            // 대시보드 내의 여러 워크 시트 각각에 대해
            worksheets.forEach((sheet) => {
                // 시트의 이름으로 된, 시트의 이름을 부모에게 반환하는 버튼 생성
                let btn = makeSheetBtn(sheet.name);
                // 원하는 영역에 붙이기
                $("#select-worksheet-area").append(btn);
            });

            //이 샘플의 상위 확장에서 보낸 openPayload는
            // 새로 고침을위한 기본 시간 간격입니다. 이것은 대안으로 저장 될 수 있습니다
            // 설정에 있지만이 샘플에서는 페이로드 열기 및 닫기를 보여주기 위해 사용됩니다.
            // $("#interval").val(openPayload);
            $("#closeButton").click(closeDialog);
        });
    });
    function selected(sheetName) {
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        // Find a specific worksheet
        mySheetName = sheetName;
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === sheetName;
        });
        // let unregisterHandlerFunction = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, filterChangedHandler);
        // unregisterHandlerFunctions.push(unregisterHandlerFunction);
        // console.log(unregisterHandlerFunction);
        worksheet.getSummaryDataAsync().then(function (sumdata) {
            const worksheetData = sumdata;
            var i = 0;
            var colArray = [];
            for (i = 0; i < worksheetData.columns.length; i++) {
                colArray.push(worksheetData.columns[i].fieldName);
            }
            console.log(colArray);
            $("#select-column-area").empty();
            colArray.forEach((col) => {
                // 시트의 이름으로 된, 시트의 이름을 부모에게 반환하는 버튼 생성
                let btn = makeColBtn(col);
                // 원하는 영역에 붙이기
                $("#select-column-area").append(btn);
            });

            // $("#sheetname").text(JSON.stringify(worksheetData.data));
        });
    }

    /**
     * 확장 설정에서 선택한 데이터 소스 ID를 저장합니다.
     * 대화 상자를 닫고 페이로드를 부모에게 다시 보냅니다.
     */
    function closeDialog() {
        var sendData = {
            sheetname: mySheetName,
            colname: $("#select-column-area>button.active").text(),
        };
        console.log("11", sendData);
        tableau.extensions.settings.set("sendDataKey", JSON.stringify(sendData));

        tableau.extensions.settings.saveAsync().then((newSavedSettings) => {
            tableau.extensions.ui.closeDialog("");
        });
        console.log("Setting 저장완료");
    }
    function makeSheetBtn(sheetName) {
        const button = $("<button></button>");
        button.text(sheetName + " 선택");
        button.addClass("btn btn-block btn-outline-primary");
        // sheetName을 그대로 부모에게 반환하며 종료하는 함수 연결
        button.on("click", () => selected(sheetName));
        return button;
    }
    function makeColBtn(colName) {
        const button2 = $("<button></button>");
        button2.text(colName);
        button2.addClass("btn btn-block btn-outline-secondary");
        // sheetName을 그대로 부모에게 반환하며 종료하는 함수 연결
        button2.on("click", () => {
            $("#select-column-area>button").removeClass("active");
            $(`#select-column-area>button:contains(${colName})`).addClass("active");
        });
        return button2;
    }
})();
