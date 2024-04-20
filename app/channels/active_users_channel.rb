class ActiveUsersChannel < ApplicationCable::Channel
  include NoBrainer::Streams

  def subscribed
    @user = User.create
    Rails.logger.debug "User JSON: #{@user.as_json}"
    transmit({ current_user: @user.as_json })
    stream_from User.all, include_initial: true
  end

  def unsubscribed
    @user.destroy
  end

  def select_cells(message)
    @user.update! selected_cells: message['selected_cells']
    ActionCable.server.broadcast('active_users_stream', user_id: @user.id, selected_cells: data['selected_cells'])
  end
end
