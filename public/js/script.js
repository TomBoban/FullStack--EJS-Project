
$(document).ready(function () {
  $(".timepicker").mdtimepicker();
});


$(function () {
  $("#datepicker").datepicker({
    dateFormat: "yy-mm-dd",
    duration: "fast",
    showAnim: "fold",
    firstDay: 0,

    onSelect: function () {
      var dateObject = $(this).datepicker("getDate");
      console.log(dateObject);
    },
  });
});

//exporte les données sélectionnées
var $table = $("#table");
$(function () {
  $("#toolbar")
    .find("select")
    .change(function () {
      $table.bootstrapTable("refreshOptions", {
        exportDataType: $(this).val(),
      });
    });
});

var trBoldBlue = $("table");

$(trBoldBlue).on("click", "tr", function () {
  $(this).toggleClass("bold-blue");
});
