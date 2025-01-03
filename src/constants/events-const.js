export const ClientEvents = {
  MessageNew: 'message.new',
  MessageRead: 'message.read',
  MessageDeleted: 'message.deleted',
  MessageUpdated: 'message.updated',
  TypingStart: 'typing.start',
  TypingStop: 'typing.stop',
  ReactionDeleted: 'reaction.deleted',
  ReactionNew: 'reaction.new',
  MemberRemoved: 'member.removed',
  MemberAdded: 'member.added',
  MemberPromoted: 'member.promoted',
  MemberDemoted: 'member.demoted',
  MemberBanned: 'member.banned',
  MemberUnBanned: 'member.unbanned',
  MemberBlocked: 'member.blocked',
  MemberUnblocked: 'member.unblocked',
  MemberJoined: 'member.joined', // only use for public channel when user join from link
  Signal: 'signal',
  Notification: {
    // AddedToChannel: 'notification.added_to_channel',
    InviteAccepted: 'notification.invite_accepted',
    InviteRejected: 'notification.invite_rejected',
  },
  ChannelDeleted: 'channel.deleted',
  ChannelUpdated: 'channel.updated',
  ChannelTruncate: 'channel.truncate',
  ChannelCreated: 'channel.created',
};
