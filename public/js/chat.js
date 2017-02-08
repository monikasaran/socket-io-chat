jQuery(function($){
      var socket = io.connect();

      var title='anonymous';

      var chatOuter=$('#chatWrap');
      var chatInner=$('#chat');

      $('#nickPage').show();
      $('#chatPage').hide(); 

       $('#message').keydown(function(event) {
          if (event.keyCode == 13) {
               $('#message-box').submit()
             }
       });

       $('#nickForm').submit(function(e){
           e.preventDefault();
           title = $('#nickname').val();
           socket.emit('new user',  $('#nickname').val(),  function(data){
                if(data){
                  $('#nickPage').hide();
                    document.title=title;
                  $('#chatPage').show();
                }else{
                  $('#nickError').html("Sorry, that nickname is already taken , try something else");
                }
           });
           $('#nickname').val('');
       });

       $('#message-box').submit(function(e){
            e.preventDefault();
            socket.emit('ClientMessage',    $('#message').val(),    function(data){
              $('#chat').append("<p align='right' class='error'>"+data+"&nbsp;&nbsp;</p><br/>");
            });
            $('#message').val('');
       });

      socket.on('usernames',   function(data){
            var html='<ul>';
            for(i=0;i<data.length;i++){
              html+='<li><span>'+data[i]+'</span></li>';
            }
            html=html+'</ul>';
            $('#users').html(html);
      });

      socket.on('new message',function(data){
         if(data.nick===title){
           $('#chat').append("<p style='' align='right' class='msg'><b>"+data.nick+" : </b>"+data.msg+"&nbsp;&nbsp;</p>");
         }else{
           $('#chat').append("<p style='' align='left' class='msg'><b>&nbsp;&nbsp;&nbsp;"+data.nick+" : </b>"+data.msg+"</p>");
           alert("You got a message");
         }
         scrollCorrect();
      });

      socket.on('whisper', function(data){
          $('#chat').append("<p align='left' class='whisper'><b>&nbsp;&nbsp;&nbsp;"+data.nick+" : </b>"+data.msg+"</p><br/>");
          alert("You got a message");
       });

       socket.on('private', function(data){
           $('#chat').append("<p align='right' class='whisper'><b>"+title+"@"+data.nick+": </b>"+data.msg+"&nbsp;&nbsp;</p><br/>");

      });


      function scrollCorrect(){
           chatOuter.scrollTop(chatInner.outerHeight());
      }
    });