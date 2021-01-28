var express = require("express");
var router = express.Router();
const Scrape_all = require("./resources/scraping_functionalities.js")


// simple explaination page
router.get("/", function(req,res){
    res.sendFile(__dirname + "\\views\\index.html")
})


// url end point 
router.get("/video_id=:videoId/max_comments=:maxComments", function(req, res) {
    // creating a new scraping instance and sending the main list and reply-count to the .pug file
    ( async () => {
        const scraper = new Scrape_all(req.params["videoId"], req.params["maxComments"])
        console.log(`Please wait while comments and replies are being fetched. worker: ${process.pid}`)
        const [new_ans, total_replies] = await scraper.starter()
        res.render((__dirname + "\\views\\comment_dump.pug"), {comment_dump: new_ans, reply_count: total_replies});
     })();
})

  
module.exports = router
