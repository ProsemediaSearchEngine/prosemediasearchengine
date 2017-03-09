$(document).on("keyup",'#demo1_text',function() {
    var max = 300;
    var entry = $(this).val();
    var length = entry.length;
    var charRemaining = max-length;
    if(charRemaining<=0){
        $("#demo1_err").html(charRemaining+" character remaining. <p class='errmsg'>You reached maximum characters limit.</p>");
    }else{
        $("#demo1_err").html(charRemaining+" character remaining.");
    }
});

$(document).on("keyup",'.updatepost',function() {
	var classname = $(this).attr("class");
	var id = $(this).attr("id");
	var text = $(this).val();
    var res = classname.split("_");
    var coloumn = res[0];
	$.post( "/updateDemo", { id: id, coloumn: coloumn, text: text})
      .done(function(result){
        $("#u_message_"+id).html("Update done.");
	});
});

$( document ).ready(function() {
	$(".add_new_demo_div").hide();
	$(".update_demo_div").hide();
	$( ".add_new_demo_button" ).click(function() {
		var txt;
		var r = prompt("Please enter admin password", "");
		if (r == "prose12") {
			$(".add_new_demo_div").toggle("slow");
		} else {
			alert("Invalid password")			
		}
	});

	$( ".update_demo_btn" ).click(function() {
		var id = $(this).data("id");
	  	var txt;
		var r = prompt("Please enter admin password", "");
		if (r == "prose12") {
			$("#hidden_"+id).toggle("slow");
			} else {
			alert("Invalid password")			
		}
	});
});