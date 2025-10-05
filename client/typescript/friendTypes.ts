// src/types/friend.ts

// A reusable type for a populated user in the context of the friend system
export interface FriendUser {
    _id: string;
    firstName: string;
    lastName: string;
    userName?: string;
    userId?: number;
    profile: {
        profilePic?: string;
    };
}

// The response from the main GET endpoint
export interface AllFriendDataResponse {
    friends: FriendUser[];
    receivedRequests: FriendUser[];
    sentRequests: FriendUser[];
    blockedUsers: FriendUser[];
}

// Payloads for mutation actions
export interface FriendActionPayload {
    receiverId?: string; // for sendFriendRequest
    requesterId?: string; // for accept/reject
    friendId?: string; // for unfriend
    blockUserId?: string; // for block
    unblockUserId?: string; // for unblock
}