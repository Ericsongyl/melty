import { v4 as uuidv4 } from "uuid";

import { Joule, BotExecInfo, DiffInfo, CodeInfo, JouleHumanChat, JouleBotChat, JouleBotCode, JouleHumanConfirmCode, ClaudeMessage } from "../types";

export function author(joule: Joule): "human" | "bot" {
	switch (joule.jouleType) {
		case "HumanChat":
		case "HumanConfirmCode":
			return "human";
		case "BotChat":
		case "BotCode":
			return "bot";
		default:
			throw new Error(`Unknown Joule type ${joule}`);
	}
};

// todo JouleBotChat might not always be valid
export function createJouleError(errorMessage: string): JouleBotChat {
	return createJouleBotChat(
		errorMessage,
		{
			rawOutput: "[error encountered]",
			contextPaths: {
				meltyRoot: '',
				paths: []
			},
		},
		"error",
		null
	);
}

export function createJouleHumanConfirmCode(confirmed: boolean): JouleHumanConfirmCode {
	return {
		jouleType: "HumanConfirmCode",
		id: uuidv4(),
		jouleState: "complete",
		confirmed
	};
}

export function createJouleHumanChat(message: string, codeInfo: CodeInfo | null): JouleHumanChat {
	return {
		jouleType: "HumanChat",
		id: uuidv4(),
		jouleState: "complete",
		message,
		codeInfo
	};
}

export function createJouleBotChat(
	message: string,
	botExecInfo: BotExecInfo,
	jouleState: "complete" | "partial" | "error" = "complete",
	stopReason: "endTurn" | "confirmCode" | null
): JouleBotChat {
	return {
		jouleType: "BotChat",
		id: uuidv4(),
		message,
		jouleState,
		botExecInfo: botExecInfo,
		stopReason: stopReason
	};
}

export function createJouleBotCode(
	message: string,
	codeInfo: CodeInfo,
	botExecInfo: BotExecInfo,
	jouleState: "complete" | "partial" = "complete"
): JouleBotCode {
	return {
		jouleType: "BotCode",
		id: uuidv4(),
		message,
		codeInfo,
		jouleState,
		botExecInfo: botExecInfo,
	};
}

export function encodeJouleForClaude(joule: Joule): ClaudeMessage {
	// note that if we show a processed message, we'll need to use `message.length ? message : "..."`
	// to ensure no Anthropic API errors
	switch (joule.jouleType) {
		case "HumanChat":
			return { role: "user", content: joule.message };
		case "HumanConfirmCode":
			return { role: "user", content: joule.confirmed ? "[user confirmed okay to proceed]" : "[user declined to proceed]" };
		case "BotChat":
			return { role: "assistant", content: joule.botExecInfo.rawOutput };
		case "BotCode":
			return { role: "assistant", content: joule.botExecInfo.rawOutput };
		default:
			throw new Error(`Unknown Joule type ${joule}`);
	}
}
