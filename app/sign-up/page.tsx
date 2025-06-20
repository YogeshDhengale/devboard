import SignupForm from "@/components/signup-form";

export default function Page() {
  return (
    <div className="flex min-h-[calc(100vh-130px)] w-full items-center justify-center">
      <div className="w-full max-w-sm">
        <SignupForm />
      </div>
    </div>
  )
}
