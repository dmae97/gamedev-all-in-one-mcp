local HttpService = game:GetService("HttpService")

local Runtime = {}

local CONFIG = {
    runtimeName = "roblox-all-in-one-mcp-runtime",
    runtimeVersion = "0.1.0",
    protocolVersion = 1,
    bridgeMode = "http-long-poll",
    baseUrl = "http://127.0.0.1:3002",
    commandTimeoutMs = 25000,
}

local function jsonEncode(value)
    return HttpService:JSONEncode(value)
end

local function jsonDecode(value)
    return HttpService:JSONDecode(value)
end

local function request(method, url, body)
    local response = HttpService:RequestAsync({
        Url = url,
        Method = method,
        Headers = {
            ["Content-Type"] = "application/json",
        },
        Body = body and jsonEncode(body) or nil,
    })

    if not response.Success then
        error(response.StatusMessage)
    end

    if response.Body == "" then
        return nil
    end

    return jsonDecode(response.Body)
end

local function postHandshake()
    return request("POST", CONFIG.baseUrl .. "/runtime/handshake", {
        protocolVersion = CONFIG.protocolVersion,
        runtimeName = CONFIG.runtimeName,
        runtimeVersion = CONFIG.runtimeVersion,
        bridgeMode = CONFIG.bridgeMode,
        capabilities = { "run_code", "create_workspace_part" },
        lastSeenAt = DateTime.now():ToIsoDate(),
    })
end

local function submitResult(requestId, status, payload)
    return request("POST", CONFIG.baseUrl .. "/runtime/commands/result", {
        requestId = requestId,
        status = status,
        completedAt = DateTime.now():ToIsoDate(),
        output = payload.output,
        data = payload.data,
        error = payload.error,
    })
end

local function handleRunCode(payload)
    local fn, compileError = loadstring(payload.code)
    if not fn then
        return false, { error = compileError or "Failed to compile Luau code." }
    end

    local ok, result = pcall(fn)
    if not ok then
        return false, { error = tostring(result) }
    end

    return true, { output = tostring(result) }
end

local function handleCreateWorkspacePart(payload)
    local part = Instance.new("Part")
    part.Name = payload.name
    part.Anchored = payload.anchored
    part.Position = Vector3.new(payload.position.x, payload.position.y, payload.position.z)
    part.Size = Vector3.new(payload.size.x, payload.size.y, payload.size.z)
    part.Parent = workspace

    return true, {
        output = "created:" .. part:GetFullName(),
        data = {
            fullName = part:GetFullName(),
            anchored = part.Anchored,
        },
    }
end

local function handleCommand(command)
    if command.kind == "run_code" then
        return handleRunCode(command.payload)
    end

    if command.kind == "create_workspace_part" then
        return handleCreateWorkspacePart(command.payload)
    end

    return false, { error = "Unsupported command kind: " .. tostring(command.kind) }
end

function Runtime.start()
    postHandshake()

    while true do
        local nextCommand = request(
            "GET",
            CONFIG.baseUrl .. "/runtime/commands/next?timeoutMs=" .. tostring(CONFIG.commandTimeoutMs)
        )

        if nextCommand and nextCommand.command then
            local ok, payload = handleCommand(nextCommand.command)
            submitResult(nextCommand.command.id, ok and "ok" or "error", payload)
        end

        postHandshake()
        task.wait(0.2)
    end
end

return Runtime
