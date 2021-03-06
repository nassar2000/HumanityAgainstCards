
   const engine = require("../../../client/gameclient/library"),
   room = require("../../database/room"),
   user = require("../../database/user");
   generate = require("../../utils/generate");
   f_header = "[routes/room/rooms.js]";

 

   module.exports = function (app) {
      
       app.post("/rooms", async (req, res) => {
           try {

               if(!req.body.session) throw "No session provided!";
               let cookie_session = "";
               while (cookie_session.length < 10) {
                   cookie_session = generate.unique(req.body.username, 32);
                   if (!await user.session_is_unique(cookie_session)) {
                       cookie_session = "";
                   }
               }
               if(await user.session_verify(req.body.session) == false) throw "No session found!";
               else {
                   let new_value = cookie_session;
                   if(await user.session_update(req.body.session, new_value) == false) throw "No session updated";
               }
              
               if(!req.body.type) throw "No type provided!";
               var  v_id;
               if(req.body.type=="create_room" )
               {
                   if(!req.body.room_name) throw "No room_name provided!";
                   if(!req.body.score_limit) throw "No score_limite provided!";
                   if(!req.body.max_players) throw "No max_players provided!";
                   
                   v_id= await room.get_next_id().catch((e) => { console.error(e.message);  });
                   console.log(typeof(v_id)+ " "+ v_id);
                   v_id=v_id+1;
                   let room_obj={
                       id:v_id,
                       session: req.body.session, 
                       room_name: req.body.room_name,
                       score_limit: req.body.score_limit,
                       max_players:req.body.max_players,
                       players_in_game:0
                   }

                   var status1=await room.insert_room(room_obj).catch((e) => { console.error(e.message);  });
                  if(true!=status1) throw "Error at inserting in db.";

               }
               else if(req.body.type=="delete_room"){
           
                   if(!req.body.roomID) throw " No roomID provided!";
                   if(! await room.room_exist(req.body.roomID)) throw " Room with this id dose not exist.";
                   else 
                       if(! await room.delete_room(req.body.roomID)) throw "Internal problem.";
                   
               }
               else throw "Type of command not detected."
               
              
               if(req.body.type!="create_room" )res.status(200).send(JSON.stringify({  success: true, session: cookie_session }));
               else res.status(200).send(JSON.stringify({  success: true, roomID:  v_id, session: cookie_session }));
           } catch (e) {
               console.log("prinde eroarea "+ e);
               res.status(417).send(JSON.stringify({ success: false, session: cookie_session, err: e }));
           }
       });
      

       app.get("room/join", async (req, res) => {
           try { 
                if(!req.body.roomID) throw "No roomID provided!";
                if(!req.body.session) throw "No session provided!";

                //TODO add session validation
                
                 var user_id=await user.get_user_id().catch((e) => { console.error(e.message); });
                  
               
                var cookie_session="123";
              
               res.status(200).send(JSON.stringify({  success: max, session: cookie_session }));
           } catch (e) {
               console.log(e.message);
               res.status(417).send(JSON.stringify({ success: false, session: cookie_session, err: e.message }));
           }
       });
   };
   