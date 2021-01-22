var express = require("express");
var router = express.Router();
const Scrape_all = require("./resources/scraping_functionalities.js")


console.log(Scrape_all)
router.get("/", function(req,res){
    res.sendFile(__dirname + "\\views\\index.html")
})

router.get("/video_id=:videoId/max_comments=:maxComments", function(req, res) {
    console.log(req.params);
    ( async () => {
        
        const trying = new Scrape_all(req.params["videoId"], req.params["maxComments"])
        let new_ans = await trying.starter()

        console.log(new_ans);
        res.render((__dirname + "\\views\\comment_dump.pug"), {comment_dump: new_ans});
        console.log("done");
        console.log(trying.main_list.length)
        
     })();
    
    
})

  
module.exports = router
