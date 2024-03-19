class ActiveUsersChannel < ApplicationCable::Channel
  include NoBrainer::Streams

  def subscribed
    @user = User.create
    stream_from User.all, include_initial: true
  end

  def unsubscribed
    @user.destroy
  end
end
