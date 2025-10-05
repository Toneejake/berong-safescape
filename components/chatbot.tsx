"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm the BFP Sta Cruz assistant. How can I help you with fire safety today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSend = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simple bot response logic
    setTimeout(() => {
      const botResponse = generateBotResponse(inputValue)
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const generateBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase()

    if (lowerInput.includes("fire") && lowerInput.includes("extinguisher")) {
      return "To use a fire extinguisher, remember PASS: Pull the pin, Aim at the base, Squeeze the handle, and Sweep side to side. Check our Adult section for detailed tutorials!"
    }
    if (lowerInput.includes("emergency") || lowerInput.includes("911")) {
      return "In case of fire emergency, call 911 immediately. Our emergency hotline is also available at (02) 8888-0000."
    }
    if (lowerInput.includes("smoke detector") || lowerInput.includes("alarm")) {
      return "Smoke detectors should be tested monthly and batteries replaced annually. Install them on every level of your home, especially near bedrooms."
    }
    if (lowerInput.includes("kids") || lowerInput.includes("children")) {
      return "We have a dedicated Kids section with educational games and modules! Children can learn fire safety in a fun, interactive way."
    }
    if (lowerInput.includes("professional") || lowerInput.includes("training")) {
      return "Our Professional section offers advanced firefighting techniques, fire codes, and BFP manuals. Access requires professional credentials or admin permission."
    }
    if (lowerInput.includes("contact") || lowerInput.includes("location")) {
      return "BFP Sta Cruz Fire Station is located in Sta Cruz, Philippines. Contact us at (02) 8888-0000 or bfp.stacruz@bfp.gov.ph"
    }

    return "Thank you for your question! For specific fire safety information, please explore our Dashboard, Adult, or Professional sections. For emergencies, always call 911."
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary shadow-lg hover:bg-primary/90 z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] flex flex-col shadow-2xl z-50 border-secondary">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">BFP Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about fire safety..."
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  )
}
