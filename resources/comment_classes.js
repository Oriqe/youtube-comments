 class CreateReply {
    constructor(text_space, user_name) {
      this.text = text_space
      this.user_name = user_name
      
    }
    getText() {
      return this.text
    }
    
    getUserName() {
      return this.user_name
    }
  }
  
  
  class CreateComment extends CreateReply {
    constructor(text_space, user_name, id, reply, channel_url){
      super(text_space, user_name)
      this.id = id
      this.reply = reply
      this.final_reply_list = []
      this.channel_url = channel_url
    }
  
    getId() {
      return this.id
    }

    getChannelUrl() {
        return this.channel_url
    }
  
    getReply() {
      return this.reply
    }

    getReplyList() {
      return this.reply_list
    }
  
    setReplyList(reply_list) {
      this.reply_list = reply_list
    }
  
    setFinalReplyList(final_reply_list) {
      this.final_reply_list = final_reply_list
    }

    getFinalReplyList() {
      return this.final_reply_list
    }
  
  }

  module.exports = [CreateComment, CreateReply]
