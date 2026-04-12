local RuntimeModule = require(script.Parent.init)

local PluginBootstrap = {}

local function createToolbarButton(pluginInstance)
    local toolbar = pluginInstance:CreateToolbar("Roblox All-in-One MCP")
    local button = toolbar:CreateButton(
        "Runtime",
        "Start the Roblox All-in-One MCP runtime loop",
        ""
    )

    button.Click:Connect(function()
        task.spawn(function()
            RuntimeModule.start()
        end)
    end)

    return button
end

function PluginBootstrap.start(pluginInstance)
    createToolbarButton(pluginInstance)

    task.spawn(function()
        RuntimeModule.start()
    end)
end

return PluginBootstrap
