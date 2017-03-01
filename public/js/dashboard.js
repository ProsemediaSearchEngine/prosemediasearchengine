$( document ).ready(function() {
 
  var interval = setInterval(function(){ 
    jQuery('.alertforaccess').effect('bounce', {times: 3}, "slow");
  }, 500);

    $("#searchloaderTable").html("<img src='images/search.gif' width='150' height='150'>");

    $.post( "/allurldata")
      .done(function(result){
      $("#searchloaderTable").html("");
      var html = "";   
      for(i=0; i<result.length; i++){
        html = html + '<tr>'+
          '<td>'+result[i].postedby+'</td>'+
          '<td><p class="linkindatatable"><span class="w3-tag w3-small w3-theme-l4 linkfromsearch"><a class="previewlink">'+result[i].url+'</a></span></p></td>'+
          '<td><p contenteditable="true">'+result[i].title+'</p></td>'+
          '<td><p contenteditable="true" class="updateEmail" data-id="'+result[i]._id+'">'+result[i].email+'</p></td>'+
          '<td><p contenteditable="true" class="updatePhone" data-id="'+result[i]._id+'">'+result[i].phone+'</p></td>'+
          '<td><p contenteditable="true" class="updateComment" data-id="'+result[i]._id+'">'+result[i].comment+'</p></td>'+
          '<td><span class="removethis" data-id="'+result[i]._id+'"><i class="fa fa-remove"></i> <b style="display: none;">'+result[i].body+'</b></span></td>'+
          '</tr>';
      }
      var table = '<table id="example1" class="display" cellspacing="0"><thead><tr><th>Posted By</th><th>URL</th><th>TITLE</th><th>EMAIL</th><th>PHONE</th><th>COMMENT</th><th>REMOVE</th></tr></thead><tbody>'+html+'</tbody></table>';
      $('#showsearch').html(table);
        $('#example1').dataTable({
        dom: 'Blfrtip',
        buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print', 'colvis'
        ]
    }, {"sPaginationType": "full_numbers", "oLanguage": {
            "sSearch": "FILTER:"
        },"bDestroy": true, "iDisplayLength": 10, "aLengthMenu": [[5, 10, 15, 25, 50, 100 , -1], [5, 10, 15, 25, 50, 100, "All"]],});
        $(".dataTables_length select").addClass("selectEntry").attr("placeholder", "Filter search").append('<br><br><br><br>');
        $(".dataTables_filter input").addClass("searchInput").attr("placeholder", "Portfolio Filter search");
        });
});



$( document ).ready(function() {
     $('#allurl').DataTable({
      responsive: true
    });
     $(".dataTables_length select").addClass("selectEntry").attr("placeholder", "Filter search").append('<br><br><br><br>');
     $(".dataTables_filter input").addClass("searchInput").attr("placeholder", "Filter search");


});

$(document).on("click","#post-other-bulk-button",function() {
  var bulkurl = $(".bulk-other-input").val();
  bulkurl = bulkurl.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
  var res = bulkurl.split(" ");
  if(bulkurl==='' || bulkurl===null || res.length===1){alert("PLEASE INCLUDE MORE THAN ONE URLS")}
  else{
     $.post( "/saveOtherBulkSite", { bulkurl: bulkurl})
      .done(function(result){
      alert(result)    
    });
  }
});

$(document).on("click",".profileimagelinktag",function() {
  $(".profileimagefiletag").click();
});

$(document).on("click",".submit-profile-button",function() {
  var filename = $(".profileimagefiletag").val();
  if(filename==="") $(".profilepicerror").html("<br><br><span class='alert'>Please select image first.</span>")
});

$(document).on("change",".profileimagefiletag",function() { 
        var input = document.getElementById("profileimagefiletag");
        var fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function(event){
        var img = document.getElementById("dp");

        img.src = event.target.result;
        $(".dp").val(img.src);
       
        }
    });

$(document).on("click","#post-linkedin-bulk-button",function() {
  var bulkurl = $(".bulk-linkedin-input").val();
  bulkurl = bulkurl.replace(/\s+/g, " ").replace(/^\s|\s$/g, "");
  var res = bulkurl.split(" ");
  if(bulkurl==='' || bulkurl===null || res.length===1){alert("PLEASE INCLUDE MORE THAN ONE URLS")}
  else{
     $.post( "/saveLinkedInBulkSite", { bulkurl: bulkurl})
      .done(function(result){
      alert(result)    
    });
  }
});


$(document).ready(function() {
  $("#linkindi").hide();

      $(".searchsubmit").on("click",function() {
        var keyword = $(".searchinputfield").val();
        $("#searchload").html("<img src='images/load2.gif' width='150' height='150'>"+
          "<img src='images/search.gif' width='150' height='150'>"+
          "<img src='images/load2.gif' width='150' height='150'>");
        $.post( "/search", { keyword: keyword})
          .done(function(searchresult) {
          setTimeout(function(){ 
          $('html, body').animate({
                scrollTop: $(".searchresultpannel").offset().top
            }, 500);
            $(".searchresultpannel").addClass("animated tada");
            setTimeout(function(){ 
              $(".searchresultpannel").removeClass("animated tada");
            }, 2000);
            var r = "<br>";
            var r2 = "";
            for(i=0; i<searchresult.length; i++){
              r = r + " " +'<span class="w3-tag w3-small w3-theme-l4 linkfromsearch"><a class="previewlink">'+searchresult[i].url+'</a></span>';
              r2 = r2 +"<br><br>"+ searchresult[i].url;
            }
            $("#searchload").html("<img src='images/done.jpg' width='50' height='50'>"+
              "<h2>"+searchresult.length+" RESULT FOR <b class='keywordsearch'> "+keyword.toUpperCase()+" </b> KEYWORD</h2>");
            if(searchresult.length===0){
              $("#bookmarkandsendemail").addClass("disableclick");
              r = "<p class='errmsg'>Sorry, No results found. Please try again with different keyword</p>";
            }else{
              $("#bookmarkandsendemail").removeClass("disableclick");
            }
          $("#searchresult").html(r);
          $("#bookmarkeyword").val(keyword);
          $("#emailresult").val(r2);
          $("#bookmarklink").attr("href", "savebookmark/"+keyword)
        }, 2000);
      });
    });

      $(".bookmakshow").on("click",function() {
        var keyword = $(this).text();
        $("#searchload").html("<img src='images/load2.gif' width='150' height='150'>"+
          "<img src='images/search.gif' width='150' height='150'>"+
          "<img src='images/load2.gif' width='150' height='150'>");
        $.post( "/search", { keyword: keyword})
          .done(function(searchresult) {
          setTimeout(function(){ 
          $('html, body').animate({
                scrollTop: $(".searchresultpannel").offset().top
            }, 500);
            $(".searchresultpannel").addClass("animated tada");
            setTimeout(function(){ 
              $(".searchresultpannel").removeClass("animated tada");
            }, 2000);
            var r = "<br>";
            var r2 = "";
            for(i=0; i<searchresult.length; i++){
              r = r + " " +'<span class="w3-tag w3-small w3-theme-l4 linkfromsearch"><a class="previewlink">'+searchresult[i].url+'</a></span>';
              r2 = r2 +"<br><br>"+ searchresult[i].url;
            }
            $("#searchload").html("<img src='images/done.jpg' width='50' height='50'>"+
              "<h2>"+searchresult.length+" RESULT FOR <b class='keywordsearch'> "+keyword.toUpperCase()+" </b> KEYWORD</h2>");
            if(searchresult.length===0){
              $("#bookmarkandsendemail").addClass("disableclick");
              r = "<p class='errmsg'>Sorry, No results found. Please try again with different keyword</p>";
            }else{
              $("#bookmarkandsendemail").removeClass("disableclick");
            }          $("#searchresult").html(r);
          $("#bookmarkeyword").val(keyword);
          $("#emailresult").val(r2);
          $("#bookmarklink").attr("href", "savebookmark/"+keyword);
        }, 2000);
        });
      });
});

$(document).on("click","#sendemailbutton",function() {
  var links = $("#emailresult").val();
  var keyword = $("#bookmarkeyword").val();
  $('.sendresultinemails').each(function(){
     var email = $(this).val();
    if(validateEmail(email)){
    $(this).next().hide();
    $(this).remove();
      $.post( "/sendresultinemails", { key: keyword, links: links, email: email})
        .done(function(email) {
          var msg = "The result email was successfully created and sent to "+email;
          $("#appendemailmsg").append('<div class="panel panel-success animated lightSpeedIn"><div class="panel-heading">'+msg+'</div></div>')
      });
    }
  })
           
});

function validateEmail(email) {
    var x = email;
    var atpos = x.indexOf("@");
    var dotpos = x.lastIndexOf(".");
    if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        var msg = "Invalid email: "+email;
        $("#appendemailmsg").append('<div class="panel panel-danger animated tada"><div class="panel-heading">'+msg+'</div></div>')
        return false;
    }else{
      return true;
    }
}

$(document).on("click",".deletethisportfolio",function() {
  var r = confirm("Are you sure you want to delete this URL?");
  if (r == true) {
  var url = $(this).attr("id");
  $(document).click();
  $(this).closest("tr").fadeOut("slow");
  $.post( "/deletethisportfolio", { url: url})
    .done(function(searchresult) {
    location.reload()
  });
  } else {
    txt = "You pressed Cancel!";
  }            
});


$(document).on("click",".removethis",function() {
  var r = confirm("Are you sure you want to delete this URL?");
  if (r == true) {
  var id = $(this).data("id");
  $(this).closest("tr").addClass("animated zoomOutUp");
  $(this).closest("tr").fadeOut("slow");
  $.post( "/removeurl", { id: id})
    .done(function(searchresult) {
    $(this).parent("tr").hide();
  });
  } else {
    txt = "You pressed Cancel!";
  }            
});

$(document).on("click",".bookmarkthisportfolio",function() {
  var url = $(this).attr("id");
  $(".bookmarkthisportfolio").html("<img src='images/buttonloader.gif' width='22' height='22'> SAVING...");
  $.post( "/bookmarkthisportfolio", { url: url})
    .done(function(searchresult) {
    setTimeout(function(){ 
      $(".bookmarkthisportfolio").html("BOOKMARK SUCCESSFULL");
    }, 1000);  
  });
});


 $(function () {
 
  $("#rateYo").rateYo({
    normalFill: "#A0A0A0"
  });
 
});
$(document).on("keyup",".updateComment",function() {
  var id = $(this).data("id");
  var comment = $(this).text();
  $.post( "/updateComment", { id: id, comment: comment})
    .done(function(updatecomment) {
  });        
});

$(document).on("click",".deleteportfoliobookmark",function() {
  var id = $(this).attr("id");
  $("#show_"+id).addClass("animated hinge");
   $.post( "/deleteportfoliobookmark", { id: id})
    .done(function(updatecomment) {
      setTimeout(function(){ 
        $("#show_"+id).hide();
      }, 2000);
  });        
});

$(document).on("keyup",".updatePhone",function() {
  var id = $(this).data("id");
  var phone = $(this).text();
  $.post( "/updatePhone", { id: id, phone: phone})
    .done(function(updatecomment) {
  });        
});

$(document).on("keyup",".updateEmail",function() {
  var id = $(this).data("id");
  var email = $(this).text();
  $.post( "/updateEmail", { id: id, email: email})
    .done(function(updatecomment) {
  });        
});

$(document).on("click",".updateStatus",function() {
  var id = $(this).data("id");
  $(".pendinguser_"+id).addClass("animated fadeOutRight");
   setTimeout(function(){ 
      $("#pendinguser_"+id).hide();
    }, 1000);
  $.post( "/updateStatus", { id: id})
    .done(function(updatecomment) {
  });        
});

   

$(document).on("click",".declineAccessRequest",function() {
  var id = $(this).data("id");
  var r = confirm("Are you sure you want to deny this request??");
  if (r == true) {
  $(".pendinguser_"+id).addClass("animated fadeOutRight");
   setTimeout(function(){ 
      $(".pendinguser_"+id).hide();
    }, 1000);
  $.post( "/declineAccessRequest", { id: id})
    .done(function(updatecomment) {
  });
  } else {
    txt = "You pressed Cancel!";
  }        
});

$(document).on("click",".previewlink",function() {
  var link = $(this).text();
  if(link.includes('https://www.linkedin.com/')) {
    window.open(link);
    return;
  }
  $("#modaldivLabel").html("Portfolio Preview: "+'<span class="w3-tag w3-small w3-theme-l4 linkfromsearch"><a href="'+link+'" target="_blank">'+link+'</a></span>');
  
  $(".modalbutton").click();
  $(".modal-body").html("<iframe src='"+link+"' class='iframeclass'><p>Your browser does not support iframes.</p></iframe>");
    $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-danger"><span class="deletethisportfolio" id="'+link+'"><i class="fa fa-remove" aria-hidden="true"></i> Remove Portfolio</span></button>'+
    '<button type="button" class="btn btn-warning"><span class="bookmarkthisportfolio" id="'+link+'"><i class="fa fa-bookmark" aria-hidden="true"></i> Bookmark Portfolio</span></button>'+
    '<button type="button" class="btn btn-primary modalbutton"><a href="'+link+'" target="_blank">Read More </a></button>');
});

$(document).on("click",".viewallurl",function() {
  $('html, body').animate({
        scrollTop: $("#viewallsection").offset().top
    }, 500);  
  setTimeout(function(){ 
    $("#viewallsection").addClass("animated tada");
  }, 500);
  setTimeout(function(){ 
    $("#viewallsection").removeClass("animated tada");
  }, 2000);
});


$(document).on("click",".bulk-linkedin-button",function() {
$("#modaldivLabel").html("Include linkedin portfolio sites in bulk.");
  $(".modalbutton").click();
  $(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> Enter a list of LinkedIn profiles, one per line. For including other sites, select <b>Include sites in bulk (OTHER)</b> option from menu dropdown.<br><br><span class="alert">Linkedin Blocked this functionality.</span></div><div class="col-md-6">'+
    '<textarea class="bulk-linkedin-input" placeholder="INCLUDE LINKED-IN URLS IN BULK"></textarea></div></div>');
  $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="post-linkedin-bulk-button">INCLUDE URLS IN BULK</button>');
});

$(document).on("click",".bulk-other-button",function() {
$("#modaldivLabel").html("Include portfolio sites in bulk.");
  
  $(".modalbutton").click();
  $(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> Enter a list of sites, one per line. For including LinkedIn sites, select <b>Include sites in bulk (LinkedIn)</b> option from menu dropdown.<br><br><apan class="alert">NO LINKEDIN URL</span></div><div class="col-md-6">'+
    '<textarea class="bulk-other-input" placeholder="INCLUDE PORTFOLIO URLS IN BULK"></textarea></div></div>');
  $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="post-other-bulk-button">INCLUDE URLS IN BULK</button>');
});

// post-other-bulk-button
$(document).on("click",".bulk-pdf-button",function() {
$("#modaldivLabel").html("Upload portfolio in PDF format");
  $(".modalbutton").click();
  $(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3>This section is basically to upload resumes or portfolios in PDF format. User can upload one or multiple PDF files to our server.</div><div class="col-md-6">'+
          '<form action="savepdfs" method="post" enctype="multipart/form-data">'+
            '<input type="file" name="file" accept="application/pdf" id="100portfolio" required="true" multiple><br><br>'+
            '<input type="submit"  style="display: none;" id="submit-pdf-button" value="submit">'+
          '</form>'+
        '</div></div>');
  $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary savepdfsavebutton">SAVE PORTFOLIOS</button>');
});

$(document).on("click",".savepdfsavebutton",function() { 
        var $fileUpload = $("#100portfolio");
if (parseInt($fileUpload.get(0).files.length)>100){
       alert("You can select only 100 Portfolios");
    } else {
    $("#submit-pdf-button").click();
  }
});

$(document).on("click",".onebyonelinkedin",function() {
$("#modaldivLabel").html("Save LinkedIn site individually.");
  $(".modalbutton").click();
$(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> Enter a LinkedIn site. For including other site, select <b>(Include OTHER URL)</b> option from menu dropdown.<br><br><span class="alert"> Only LinkedIn sites are allowed.</span></div><div class="col-md-6">'+
        '<div>'+
          '<form action="saveLinkedinUrlIndividually" method="post">'+
            '<input type="text" name="url" class="indiurl input" placeholder="Enter URL" required="true"><br>'+
            '<input type="text" name="email" class="indiemail input" placeholder="Enter Email"><br>'+
            '<input type="text" name="phone" class="indiphone input" placeholder="Enter Phone"><br>'+
            '<input type="text" name="comments" class="indicomments input" placeholder="Enter Comments"><br><br>'+
            '<input type="submit" style="display: none;" id="save_one_linkedin_url_submit" value="submit">'+
          '</form>'+
        '</div></div></div>');
    $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="save_one_linkedin_url_button">SAVE PORTFOLIOS</button>');});

$(document).on("click","#save_one_linkedin_url_button",function() { $("#save_one_linkedin_url_submit").click();});

$(document).on("click",".onebyoneother",function() {
$("#modaldivLabel").html("Save portfolio link individually.");
  $(".modalbutton").click();
$(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> Enter a site of portfolio. For including LinkedIn site, select <b>(Include LinkedIn URL)</b> option from menu dropdown.<br><br><span class="alert"> No LinkedIn sites are allowed.</span></div><div class="col-md-6">'+
        '<div>'+
          '<form action="saveurlindividually" method="post">'+
            '<input type="text" name="url" class="indiurl input" placeholder="Enter URL" required="true"><br>'+
            '<input type="text" name="email" class="indiemail input" placeholder="Enter Email"><br>'+
            '<input type="text" name="phone" class="indiphone input" placeholder="Enter Phone"><br>'+
            '<input type="text" name="comments" class="indicomments input" placeholder="Enter Comments"><br><br>'+
            '<input type="submit" style="display: none;" id="save_one_url_submit" value="submit">'+
          '</form>'+
        '</div></div></div>');
    $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="save_one_url_button">SAVE PORTFOLIOS</button>');});

$(document).on("click","#save_one_url_button",function() { $("#save_one_url_submit").click();});

$(document).on("click",".onebyonepdf",function() {
$("#modaldivLabel").html("Upload portfolio in PDF format.");
  $(".modalbutton").click();
$(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> This section is basically to upload resumes or portfolios in PDF format. User can upload multiple PDF files to our server from <b>Include PDF in bulk</b> from <b>Bulk upload dropdown</b>.<br><br><span class="alert"> Only PDF format are allowed.</span></div><div class="col-md-6">'+
        '<div>'+
          '<form action="uploadOnePdf" method="post" enctype="multipart/form-data">'+
            '<input type="file" name="file" accept="application/pdf" required="true"><br>'+
            '<input type="submit" style="display: none;" id="save_one_pdf_submit" value="submit">'+
          '</form>'+
        '</div></div></div>');
    $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="save_one_pdf_button">SAVE PORTFOLIOS</button>');});

$(document).on("click","#save_one_pdf_button",function() { $("#save_one_pdf_submit").click();});

$(document).on("click",".textupload",function() {
$("#modaldivLabel").html("Upload text.");
$(".modalbutton").click();
$(".modal-body").html('<div class="row"><div class="col-md-6"><h3>GUIDE:</h3> This section is basically to upload resumes or portfolios in PDF format. User can upload one or multiple PDF files to our server.<br><br><span class="alert"> Only PDF format are allowed.</span></div><div class="col-md-6">'+
        '<div>'+
          '<form action="saveSiteText" method="post">'+
            '<input type="text" name="url" class="input" placeholder="Enter URL" required="true"><br>'+
            '<textarea name="text" placeholder="INCLUDE SITE TEXT" class="textarea1" required="true"></textarea>'+
            '<input type="submit" style="display: none;" id="save_text" value="submit">'+
          '</form>'+
        '</div></div></div>');
    $(".modal-footer").html('<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
    '<button type="button" class="btn btn-primary" id="save_text_button">SAVE TEXT</button>');});

$(document).on("click","#save_text_button",function() { $("#save_text").click();});
