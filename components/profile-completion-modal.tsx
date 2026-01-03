"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  MapPin,
  ClipboardList,
  Loader2,
  Shield
} from "lucide-react"
import { 
  BARANGAYS_SANTA_CRUZ, 
  ALL_SCHOOLS, 
  OCCUPATION_CATEGORIES, 
  GENDER_OPTIONS,
  GRADE_LEVELS,
  getScoreRating
} from "@/lib/constants"
import { useAuth } from "@/lib/auth-context"

interface AssessmentQuestion {
  id: number
  question: string
  options: string[]
  category: string
}

interface ProfileCompletionModalProps {
  isOpen: boolean
  onComplete: () => void
}

export function ProfileCompletionModal({ isOpen, onComplete }: ProfileCompletionModalProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: Profile, 2: Pre-Test, 3: Results
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [result, setResult] = useState<{
    score: number
    maxScore: number
  } | null>(null)

  const [data, setData] = useState({
    gender: "",
    barangay: "",
    school: "",
    schoolOther: "",
    occupation: "",
    occupationOther: "",
    gradeLevel: "",
    dataPrivacyConsent: false,
    preTestAnswers: {} as Record<number, number>,
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const isKid = user?.age ? user.age < 18 : false

  useEffect(() => {
    if (step === 2 && questions.length === 0) {
      fetchQuestions()
    }
  }, [step])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const role = isKid ? "kid" : "adult"
      const response = await fetch(`/api/assessment/questions?role=${role}&type=preTest`)
      if (response.ok) {
        const result = await response.json()
        setQuestions(result.questions || [])
      } else {
        setError("Failed to load assessment questions")
      }
    } catch (err) {
      setError("Failed to load assessment questions")
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateProfile = (): boolean => {
    const errors: Record<string, string> = {}

    if (!data.barangay) errors.barangay = "Please select your barangay"
    if (!data.gender) errors.gender = "Please select your gender"
    
    if (isKid) {
      if (!data.school) errors.school = "Please select your school"
      if (data.school === "Other (Please specify)" && !data.schoolOther.trim()) {
        errors.schoolOther = "Please specify your school"
      }
      if (!data.gradeLevel) errors.gradeLevel = "Please select your grade level"
    } else {
      if (!data.occupation) errors.occupation = "Please select your occupation"
      if (data.occupation === "Other (Please specify)" && !data.occupationOther.trim()) {
        errors.occupationOther = "Please specify your occupation"
      }
    }

    if (!data.dataPrivacyConsent) errors.dataPrivacyConsent = "You must agree to the data privacy policy"

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNextToPreTest = () => {
    if (validateProfile()) {
      setStep(2)
      setError("")
    }
  }

  const handleAnswerQuestion = (questionId: number, answerIndex: number) => {
    setData(prev => ({
      ...prev,
      preTestAnswers: {
        ...prev.preTestAnswers,
        [questionId]: answerIndex
      }
    }))
  }

  const handleSubmit = async () => {
    if (Object.keys(data.preTestAnswers).length < questions.length) {
      setError("Please answer all questions")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender: data.gender,
          barangay: data.barangay,
          school: data.school === "Other (Please specify)" ? data.schoolOther : data.school,
          schoolOther: data.school === "Other (Please specify)" ? data.schoolOther : null,
          occupation: data.occupation === "Other (Please specify)" ? data.occupationOther : data.occupation,
          occupationOther: data.occupation === "Other (Please specify)" ? data.occupationOther : null,
          gradeLevel: data.gradeLevel || null,
          dataPrivacyConsent: data.dataPrivacyConsent,
          preTestAnswers: data.preTestAnswers,
        }),
      })

      const responseData = await response.json()

      if (responseData.success) {
        setResult({
          score: responseData.preTestScore,
          maxScore: responseData.maxScore,
        })
        setStep(3)
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(responseData.user))
      } else {
        setError(responseData.error || "Failed to complete profile")
      }
    } catch (err) {
      setError("Failed to complete profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    onComplete()
    router.refresh()
  }

  // Results view
  if (step === 3 && result) {
    const percentage = result.maxScore > 0 
      ? Math.round((result.score / result.maxScore) * 100) 
      : 0
    const rating = getScoreRating(percentage)

    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Profile Complete!</DialogTitle>
            <DialogDescription>
              Your baseline fire safety knowledge has been recorded.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Your Pre-Test Score</p>
            <div className="text-4xl font-bold" style={{ color: rating.color }}>
              {result.score} / {result.maxScore}
            </div>
            <p className="text-lg font-medium mt-2" style={{ color: rating.color }}>
              {rating.label}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Complete modules and activities to unlock the Post-Test!
            </p>
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg">
            Continue Learning
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" 
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-orange-500" />
            <span className="text-lg font-bold">SafeScape</span>
          </div>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Help us personalize your learning experience and improve community fire safety."
              : "Quick assessment to measure your current fire safety knowledge."
            }
          </DialogDescription>
          
          {/* Progress */}
          <div className="mt-4">
            <Progress value={step === 1 ? 50 : 100} className="h-2" />
            <div className="flex justify-between mt-2">
              <div className={`flex items-center gap-1 ${step >= 1 ? "text-orange-500" : "text-gray-400"}`}>
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Profile</span>
              </div>
              <div className={`flex items-center gap-1 ${step >= 2 ? "text-orange-500" : "text-gray-400"}`}>
                <ClipboardList className="w-4 h-4" />
                <span className="text-xs">Pre-Test</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Profile */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <div>
              <Label>Gender *</Label>
              <Select value={data.gender} onValueChange={(value) => updateField("gender", value)}>
                <SelectTrigger className={validationErrors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.gender && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.gender}</p>
              )}
            </div>

            <div>
              <Label>Barangay *</Label>
              <Select value={data.barangay} onValueChange={(value) => updateField("barangay", value)}>
                <SelectTrigger className={validationErrors.barangay ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your barangay" />
                </SelectTrigger>
                <SelectContent>
                  {BARANGAYS_SANTA_CRUZ.map((brgy) => (
                    <SelectItem key={brgy} value={brgy}>{brgy}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.barangay && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.barangay}</p>
              )}
            </div>

            {isKid ? (
              <>
                <div>
                  <Label>School *</Label>
                  <Select value={data.school} onValueChange={(value) => updateField("school", value)}>
                    <SelectTrigger className={validationErrors.school ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your school" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_SCHOOLS.map((school) => (
                        <SelectItem key={school} value={school}>{school}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.school && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.school}</p>
                  )}
                </div>

                {data.school === "Other (Please specify)" && (
                  <div>
                    <Label>Specify School *</Label>
                    <Input
                      placeholder="Enter your school name"
                      value={data.schoolOther}
                      onChange={(e) => updateField("schoolOther", e.target.value)}
                      className={validationErrors.schoolOther ? "border-red-500" : ""}
                    />
                    {validationErrors.schoolOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.schoolOther}</p>
                    )}
                  </div>
                )}

                <div>
                  <Label>Grade Level *</Label>
                  <Select value={data.gradeLevel} onValueChange={(value) => updateField("gradeLevel", value)}>
                    <SelectTrigger className={validationErrors.gradeLevel ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.gradeLevel && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.gradeLevel}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>Occupation *</Label>
                  <Select value={data.occupation} onValueChange={(value) => updateField("occupation", value)}>
                    <SelectTrigger className={validationErrors.occupation ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select your occupation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OCCUPATION_CATEGORIES.map((occ) => (
                        <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.occupation && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.occupation}</p>
                  )}
                </div>

                {data.occupation === "Other (Please specify)" && (
                  <div>
                    <Label>Specify Occupation *</Label>
                    <Input
                      placeholder="Enter your occupation"
                      value={data.occupationOther}
                      onChange={(e) => updateField("occupationOther", e.target.value)}
                      className={validationErrors.occupationOther ? "border-red-500" : ""}
                    />
                    {validationErrors.occupationOther && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.occupationOther}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="flex items-start space-x-2 pt-4">
              <Checkbox
                id="consent"
                checked={data.dataPrivacyConsent}
                onCheckedChange={(checked) => updateField("dataPrivacyConsent", checked)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent"
                  className={`text-sm font-medium ${validationErrors.dataPrivacyConsent ? "text-red-500" : ""}`}
                >
                  I agree to the Data Privacy Policy *
                </label>
                <p className="text-xs text-muted-foreground">
                  Your data will be used to improve community fire safety programs.
                </p>
              </div>
            </div>
            {validationErrors.dataPrivacyConsent && (
              <p className="text-sm text-red-500">{validationErrors.dataPrivacyConsent}</p>
            )}

            <Button onClick={handleNextToPreTest} className="w-full">
              Continue to Pre-Test
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Pre-Test */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2">Loading questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions available</p>
                <Button onClick={fetchQuestions} variant="outline" className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <span>{Object.keys(data.preTestAnswers).length} answered</span>
                  </div>
                  <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-orange-600 mb-2">
                    {questions[currentQuestionIndex].category}
                  </p>
                  <h3 className="text-lg font-medium mb-4">
                    {questions[currentQuestionIndex].question}
                  </h3>

                  <RadioGroup
                    value={data.preTestAnswers[questions[currentQuestionIndex].id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerQuestion(questions[currentQuestionIndex].id, parseInt(value))}
                  >
                    {questions[currentQuestionIndex].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-gray-100">
                        <RadioGroupItem value={index.toString()} id={`modal-option-${index}`} />
                        <Label htmlFor={`modal-option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Question Navigation */}
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => currentQuestionIndex === 0 ? setStep(1) : setCurrentQuestionIndex(prev => prev - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {currentQuestionIndex === 0 ? "Back to Profile" : "Previous"}
                  </Button>
                  
                  {currentQuestionIndex < questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      disabled={data.preTestAnswers[questions[currentQuestionIndex].id] === undefined}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || Object.keys(data.preTestAnswers).length < questions.length}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Complete
                          <Check className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Question dots */}
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                        currentQuestionIndex === idx
                          ? "bg-orange-500 text-white"
                          : data.preTestAnswers[q.id] !== undefined
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
