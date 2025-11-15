// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Decentralized Message Board
/// @notice Post, edit, delete, and fetch messages. Messages are limited in length to control gas.
contract MessageBoard {
    uint256 public constant MAX_MESSAGE_LENGTH = 280;

    struct Message {
        uint256 id;
        address author;
        string content;
        uint256 timestamp;
        bool deleted;
    }

    Message[] private messages;
    mapping(address => uint256[]) private userMessageIds;

    event MessagePosted(uint256 indexed id, address indexed author, string content, uint256 timestamp);
    event MessageEdited(uint256 indexed id, address indexed author, string newContent, uint256 timestamp);
    event MessageDeleted(uint256 indexed id, address indexed author, uint256 timestamp);

    /// @notice Post a message (max length enforced)
    function postMessage(string calldata content) external {
        uint256 len = bytes(content).length;
        require(len > 0, "Empty message");
        require(len <= MAX_MESSAGE_LENGTH, "Message too long");

        uint256 id = messages.length;
        messages.push(Message({ id: id, author: msg.sender, content: content, timestamp: block.timestamp, deleted: false }));
        userMessageIds[msg.sender].push(id);

        emit MessagePosted(id, msg.sender, content, block.timestamp);
    }

    /// @notice Edit your message
    function editMessage(uint256 id, string calldata newContent) external {
        require(id < messages.length, "Invalid id");
        Message storage m = messages[id];
        require(m.author == msg.sender, "Not author");
        require(!m.deleted, "Message deleted");

        uint256 len = bytes(newContent).length;
        require(len > 0, "Empty message");
        require(len <= MAX_MESSAGE_LENGTH, "Message too long");

        m.content = newContent;
        m.timestamp = block.timestamp;

        emit MessageEdited(id, msg.sender, newContent, block.timestamp);
    }

    /// @notice Mark your message as deleted (keeps history)
    function deleteMessage(uint256 id) external {
        require(id < messages.length, "Invalid id");
        Message storage m = messages[id];
        require(m.author == msg.sender, "Not author");
        require(!m.deleted, "Already deleted");

        m.deleted = true;
        m.timestamp = block.timestamp;

        emit MessageDeleted(id, msg.sender, block.timestamp);
    }

    /// @notice Get message by id
    function getMessage(uint256 id) external view returns (uint256, address, string memory, uint256, bool) {
        require(id < messages.length, "Invalid id");
        Message storage m = messages[id];
        return (m.id, m.author, m.content, m.timestamp, m.deleted);
    }

    /// @notice Total messages (including deleted)
    function totalMessages() external view returns (uint256) {
        return messages.length;
    }

    /// @notice Get recent messages with pagination (most recent first)
    /// @param offset number of most recent messages to skip
    /// @param limit maximum number to return
    function getRecentMessages(uint256 offset, uint256 limit) external view returns (Message[] memory) {
        uint256 total = messages.length;
        if (offset >= total) {
            return new Message;
        }

        uint256 end = total - offset; // exclusive
        uint256 start = end > limit ? end - limit : 0;
        uint256 size = end - start;

        Message[] memory out = new Message[](size);
        uint256 idx = 0;
        for (uint256 i = end; i > start; ) {
            unchecked { i--; }
            out[idx++] = messages[i];
        }
        return out;
    }

    /// @notice Get user message ids with pagination
    function getUserMessageIds(address user, uint256 start, uint256 limit) external view returns (uint256[] memory) {
        uint256[] storage ids = userMessageIds[user];
        uint256 total = ids.length;
        if (start >= total) return new uint256;
        uint256 end = start + limit;
        if (end > total) end = total;
        uint256 size = end - start;
        uint256[] memory out = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            out[i] = ids[start + i];
        }
        return out;
    }

    /// @notice Get messages by ids (helper for frontend)
    function getMessagesByIds(uint256[] calldata ids) external view returns (Message[] memory) {
        Message[] memory out = new Message[](ids.length);
        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            require(id < messages.length, "Invalid id");
            out[i] = messages[id];
        }
        return out;
    }
}
