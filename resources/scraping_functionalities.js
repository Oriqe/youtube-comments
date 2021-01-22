fetch = require("node-fetch");


class Scraping {
    constructor(video_id, max_comments) {
        this.main_list = []
        this.video_id = video_id
        this.max_comments = max_comments
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

    async scrape(next_page_token=false) {
        
        let url_text = this.fetch_url(false, this.video_id, next_page_token)
        
        let fetched_data = await fetch(url_text, this.get_headers())

        const data = await fetched_data.json()
        
        next_page_token = data["nextPageToken"]
        
        let comment_num = data["pageInfo"]["totalResults"]

        const json_comments = data["items"]

        
        for (let i=0; i<json_comments.length; i++) {
            var comment_dict = {}
            let comment = json_comments[i]["snippet"]["topLevelComment"]["snippet"]
            comment_dict["text"] = comment["textOriginal"]
            comment_dict["user_name"] = comment["authorDisplayName"]
            comment_dict["like_count"] = comment["likeCount"]
            comment_dict["id"] = json_comments[i]["id"]
            comment_dict["reply"] = json_comments[i]["snippet"]["totalReplyCount"]
            comment_dict["reply_list"] = 0
            comment_dict["final_reply_list"] = []
            
            
            if (comment_dict["reply"]) {
                console.log("I should have another fetch here!!!!!!!")
                let url = this.fetch_url(true, comment_dict["id"])
                comment_dict["reply_list"] = fetch(url, this.get_headers());
            
            }
            
            this.main_list.push(comment_dict)
            
        }
        
    
        return [comment_num, next_page_token]
    }

    async starter() {
        let token = false
        let total, next_token;
        let comment_total = 0
        while (true) {
      
          [total, next_token] = await this.scrape(token)
          
          token = next_token
          comment_total += total

          if (total<100) {
            break
          }
          if (comment_total > this.max_comments) {
            this.main_list = this.main_list.slice(0,this.max_comments)
              break
          }

        }

        for (let i=0; i<this.main_list.length; i++) {
            // console.log(list_to_fill[i]["reply_list"], list_to_fill[i]["reply_list"]!==0)
          if (this.main_list[i]["reply_list"] !== 0) {
            
            let promisee = await this.main_list[i]["reply_list"]
            
            const reply_data = await promisee.json()
            
            let reply_list = []
            for (let j=0; j<reply_data["items"].length; j++) {
              let reply_dict = {}
              reply_dict["text"] = reply_data["items"][j]["snippet"]["textOriginal"]
              reply_dict["user_name"] = reply_data["items"][j]["snippet"]["authorDisplayName"]
              reply_list.push(reply_dict)
              
          
              }
              this.main_list[i]["final_reply_list"] = reply_list
              
            }
            
               
          }
        
    return this.main_list
    }
}

module.exports = Scraping
