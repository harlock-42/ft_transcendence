export module Responses {
    export function userJoined(target: string, channel: string): string {
        return (target + " joined " + channel);
    }

    export function userLeft(target: string, channel: string): string {
        return (target + " left " + channel);
    }

    export function youGotInvited(sender: string, channel: string): string {
        return ("You have been INVITED to " + channel + " by " + sender);
    }

    export function userAlreadyInvited(target: string): string {
        return (target + " is already invited");
    }

    export function getInviteList(inviteList: string[]): string {
        if (inviteList.length > 0) {
            return ("INVITELIST: " + inviteList.toString());
        }
        return ("INVITELIST is empty");
    }

    export function userAlreadyMuted(channel: string, target: string): string {
        return (target + " is already muted in " + channel);
    }

    export function userAlreadyBanned(channel: string, target: string): string {
        return (target + " is already banned in " + channel);
    }

    export function youAlreadyInChannel(channel: string): string {
        return ("You are already in " + channel);
    }

    export function userAlreadyInChannel(target: string, channel: string): string {
        return (target + " is already in " + channel);
    }

    export function channelAlreadyExist(channel: string): string {
        return (channel + ": already exist");
    }

    export function noSuchChannel(channelName: string): string {
        return (channelName + ": channel not found");
    }

    export function userGotKicked(sender: string, target: string, channel: string, reason: string): string {
        return (target + " has been KICKED from " + channel + " by " + sender + ((reason.length) ? ". Reason: " + reason : ""));
    }

    export function youGotKicked(sender: string, room: string, reason: string): string {
        return ("You have been KICKED from " + room + " by " + sender + ((reason.length) ? ". Reason: " + reason : ""));
    }

    export function userGotBanned(sender: string, target: string, reason: string): string {
        return (target + " has been BANNED by " + sender + ((reason.length) ? ". Reason: " + reason : ""));
    }

    export function youGotBanned(sender: string, room: string, reason: string): string {
        return ("You have been BANNED from " + room + " by " + sender + ((reason.length) ? ". Reason: " + reason : ""));
    }

    export function youGotUnbanned(sender: string, room: string): string {
        return ("You have been UNBANNED from " + room + " by " + sender);
    }

    export function userGotMuted(sender: string, target: string, reason: string): string {
        return (target + " has been MUTED by " + sender + ((reason.length) ? ". Reason " + reason : ""));
    }

    export function youGotUnmuted(sender: string, room: string): string {
        return ("You have been UNMUTED from " + room + " by " + sender);
    }

    export function cannotPlayDisconnected(target: string): string {
        return ("Cannot invite " + target + " to PONG: " + target + " is disconnected");
    }

    export function invitedToPong(nickname: string): string {
        return (nickname + " has invited you to play a PONG game");
    }

    export function getBanlist(banList: string[]): string {
        if (banList.length > 0) {
            return ("BANLIST: " + banList.toString());
        }
        return ("BANLIST is empty");
    }

    export function notMutted(target: string): string {
        return (target + " is not MUTED");
    }

    export function cannotSendMutted(channel: string): string {
        return ("Cannot send messages to " + channel + ": You are MUTED");
    }

    export function cannotSendBlocked(target: string): string {
        return ("Cannot send messages to " + target + ": You are BLOCKED");
    }

    export function cannotJoinBanned(channel: string): string {
        return ("Cannot join " + channel + ": You are BANNED");
    }

    export function cannotJoinPrivate(channel: string): string {
        return ("Cannot join " + channel + ": This channel is PRIVATE");
    }

    export function cannotJoinBadPass(channel: string): string {
        return ("Cannot join " + channel + ": Bad password");
    }

    export function passwordChanged(channel: string): string {
        return ("Password successfully changed on " + channel);
    }

    export function privacyChanged(sender: string, channel: string, setting: string): string {
        return (sender + " changed " + channel + " privacy settings to " + setting.toUpperCase());
    }

    export function topicChanged(sender: string, channel: string): string {
        return (channel + "'s topic has been updated by " + sender);
    }

    export function userGotPromoted(sender: string, target: string, channel: string, grade: string): string {
        return (target + " has been promoted " + grade + " in " + channel + " by " + sender);
    }

    export function userGotDemoted(sender: string, target: string, channel: string, grade: string): string {
        return (target + "is no longer " + grade + " in " + channel + ": demoted by " + sender);
    }

    export function targetNotFound(target: string): string {
        return (target + ": target not found");
    }

    export function founderLeftChannel(channel: string) {
        return ("The FOUNDER of " + channel + " left, " + "channel has been deleted");
    }

    export function autoTarget() {
        return ("You can't target yourself");
    }

    export function alreadyFriends(target: string) {
        return (target + " is already in your FRIENDLIST");
    }

    export function notFriends(target: string) {
        return (target + " is not in your FRIENDLIST");
    }

    export function alreadyBlocked(target: string) {
        return (target + " is already BLOCKED");
    }

    export function notBlocked(target: string) {
        return (target + " is not BLOCKED");
    }

    export function notBanned(target: string) {
        return (target + " is not BANNED");
    }

    export function cannotAddBlocked(target: string) {
        return ("Cannot add " + target + ": You are BLOCKED");
    }

    export function permissionDenied(grade: string): string {
        return ("You must by " + grade + " to execute this command");
    }

    export function commandNotFound(arg: string): string {
        return (arg + ": command not found");
    }

    export function channelNameForbiddenChar() {
        return ("Channel name: Forbidden characters");
    }

    export function channelNameTooBig() {
        return ("Channel name: Max. lenght is 15 chars");
    }

    export function channelNameNoAlnum() {
        return ("Channel name: Must contain at least one alphanumeric character");
    }

    export function channelTopicForbiddenChar() {
        return ("Channel topic: Forbidden characters");
    }

    export function channelTopicTooBig() {
        return ("Channel topic: Max. length is 50 chars");
    }

    export function channelTopicNoAlnum() {
        return ("Channel topic: Must contain at least one alphanumeric character");
    }

    export function channelBadImageType() {
        return ("Channel image: Bad type");
    }

    export function messageTooBig() {
        return ("Message: Max. length is 100 chars");
    }
}