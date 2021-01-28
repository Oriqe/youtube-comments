fetch = require("node-fetch");
const [CreateComment, CreateReply] = require("./comment_classes.js")


class Scraping {
  // main_list will contain all of the comment instances
  // video_id is the youtube-id in the video url
  // limit_max_comment represents the limit the user entered in the url
    constructor(video_id, max_comments) {
        this.main_list = []
        this.video_id = video_id
        this.limit_max_comments = max_comments
    }

    set_total_comments(total_comments) {
      this.total_comments = total_comments
    }

    countReplies() {
      let replies = 0
      for (let i=0; i<this.main_list.length; i++) {
        replies += this.main_list[i].getReply()
      }
      return replies
    }

    get_headers() {
        return {
        "referrer": "https://youtubecommentviewer.com/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET",
        "mode": "cors"
        }
    }

    // creating the api call
    // differentiates between the api call for the first 100 comments
    // which is different from an api call for comments beyond 100, where the 'NEXT_PAGE_TOKEN' should be at the end
    // which is also different from api calls for replies 
    fetch_url(reply, id, next_page_token=false) {
        let comment_filler = "commentThreads"
        let which_id = "videoId"
        if (reply) {
            comment_filler = "comments"
            which_id = "parentId"
        }
        let url = `https://www.googleapis.com/youtube/v3/${comment_filler}?key=AIzaSyBUt7dFDp63KcOMflf7ksZOYWcbiwxH1og&textFormat=plainText&part=snippet&${which_id}=${id}&maxResults=100&pageToken=`
        if (next_page_token) {
            url = url.concat(next_page_token)
        }

        return url
    }

    // fetching the total amount of comments from the api
    async fetch_total_comments(video_id) {
      
      const url = `https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBUt7dFDp63KcOMflf7ksZOYWcbiwxH1og&part=snippet,statistics&id=${video_id}`
      const fetched_data = await fetch(url, this.get_headers())
      const data = await fetched_data.json() 
      
      return data["items"][0]["statistics"]["commentCount"]
    }

    // fetching up to 100 comments with a single api call
    // and storing them within the main_list variable
    // each comment is represented as a class instance
    // if the comment contains replies, it sends another api call
    // and stores it in, but does not await the promise 
    async scrape(next_page_token=false) {
        
        if (!next_page_token){
          const total_comment_num = await this.fetch_total_comments(this.video_id)
          this.set_total_comments(total_comment_num)
        }

        const url_text = this.fetch_url(false, this.video_id, next_page_token)
        const fetched_data = await fetch(url_text, this.get_headers())
        const data = await fetched_data.json()
        
        next_page_token = data["nextPageToken"]
        const comment_num = data["pageInfo"]["totalResults"]
        const json_comments = data["items"]
        let reply_num = 0
        
        for (let i=0; i<json_comments.length; i++) {

          const comment = json_comments[i]["snippet"]["topLevelComment"]["snippet"]
          const comment_instance = new CreateComment(comment["textOriginal"], comment["authorDisplayName"], json_comments[i]["id"], json_comments[i]["snippet"]["totalReplyCount"], comment["authorChannelUrl"])
          if (comment_instance.getReply()) {

            reply_num += comment_instance.getReply()
            const url = this.fetch_url(true, comment_instance.getId())
            comment_instance.setReplyList(fetch(url, this.get_headers()))                 

            }
          this.main_list.push(comment_instance)   
        }
        return [comment_num, next_page_token, reply_num]
    }
    

    // handles the meta data of the video, and decides
    // how many times to call the scrape func, depending
    // on user parameters and video total comments
    // here we wait for the replies promises
    async starter() {
      let total_replies, comment_total
      total_replies = comment_total = 0
      let token = false
      let total, next_token, current_replies;

      
      while (true) {
        // calling the scraping func for every 100 comments  
        [total, next_token, current_replies] = await this.scrape(token)
        token = next_token
        total_replies += current_replies
        comment_total += total
        
        // checking the url filled parameter for max comments
        if (comment_total >= this.limit_max_comments) {
          this.main_list = this.main_list.slice(0,this.limit_max_comments)
          total_replies = this.countReplies()
          break
        }
        // checking for total comments minus replies
        if (comment_total >= this.total_comments - total_replies) {
          break
        }
      }

      // now we will await the replies promises
      for (let i=0; i<this.main_list.length; i++) {
        //checking if there are replies
        if (this.main_list[i].getReply() > 0) {
        
          const promisee = await this.main_list[i].getReplyList()
          const reply_data = await promisee.json()
          const reply_list = []

          // creating reply instance for every reply fetched for a single comment
          for (let j=0; j<reply_data["items"].length; j++) {

            const reply = new CreateReply(reply_data["items"][j]["snippet"]["textOriginal"], reply_data["items"][j]["snippet"]["authorDisplayName"])
            reply_list.push(reply)
            }

          this.main_list[i].setFinalReplyList(reply_list)
          }
        }
      
      return [this.main_list, total_replies]
    }
  }

module.exports = Scraping
