import { LoginForm } from "@/features/auth";
import { Logo } from "@/shared/ui/logo";

export function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-[380px]">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-7 text-[26px] leading-tight font-semibold tracking-tight">
            Ваши деньги
            <br />
            под контролем
          </h1>
          <p className="mt-3 max-w-[290px] text-sm text-muted-foreground">
            Просто отслеживайте расходы, доходы и смотрите, на что уходят деньги.
          </p>
        </div>
        <div className="mt-9">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
