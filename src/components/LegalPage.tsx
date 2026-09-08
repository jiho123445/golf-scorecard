import type { ReactNode } from 'react';
import { ScreenHeader } from './ScreenHeader';

interface Props {
  kind: 'privacy' | 'terms';
  onBack: () => void;
}

/**
 * 개인정보처리방침 / 이용약관 화면.
 * ⚠️ 아래 내용은 소규모 서비스를 위한 일반적인 템플릿이며 법률 자문이 아닙니다.
 *    【】로 표시된 부분(운영자명/연락처/시행일 등)을 실제 정보로 반드시 채워주세요.
 */
export function LegalPage({ kind, onBack }: Props) {
  return (
    <div className="flex flex-1 flex-col">
      <ScreenHeader title={kind === 'privacy' ? '개인정보처리방침' : '이용약관'} onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 py-6 text-sm leading-relaxed text-slate-700">
        {kind === 'privacy' ? <PrivacyContent /> : <TermsContent />}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-base font-bold text-slate-900">{title}</h2>
      <div className="space-y-2 text-slate-600">{children}</div>
    </section>
  );
}

function PrivacyContent() {
  return (
    <>
      <p className="mb-6 text-xs text-slate-400">
        본 방침은 일반적인 템플릿이며 법률 자문이 아닙니다. 【운영자명】은 실제 운영 주체명으로,
        【시행일】은 실제 배포일로 반드시 교체해주세요.
      </p>
      <Section title="1. 수집하는 개인정보 항목">
        <p>이메일 주소(로그인용), 표시 이름, 골프·파크골프 라운드 기록(날짜, 코스명, 스코어 등)</p>
      </Section>
      <Section title="2. 개인정보의 수집 및 이용 목적">
        <p>회원 식별 및 로그인, 라운드 기록 저장 및 통계 제공, 회원 문의 대응</p>
      </Section>
      <Section title="3. 개인정보의 보유 및 이용 기간">
        <p>회원 탈퇴 시 즉시 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>
      </Section>
      <Section title="4. 개인정보의 제3자 제공">
        <p>【운영자명】은 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.</p>
      </Section>
      <Section title="5. 개인정보의 처리 위탁">
        <p>서비스 운영을 위해 Google Firebase(인증·데이터베이스), Vercel(호스팅)을 이용하며, 이 과정에서 해당 사업자의 서버(해외 포함)에 정보가 저장될 수 있습니다.</p>
      </Section>
      <Section title="6. 이용자의 권리">
        <p>이용자는 언제든 본인의 개인정보 조회, 수정, 삭제(회원 탈퇴)를 요청할 수 있으며, 앱 내 설정 화면에서 직접 처리할 수 있습니다.</p>
      </Section>
      <Section title="7. 개인정보 보호책임자">
        <p>담당자: 【담당자명】</p>
        <p>연락처: 【이메일 또는 전화번호】</p>
      </Section>
      <Section title="8. 시행일">
        <p>이 방침은 【시행일】부터 적용됩니다.</p>
      </Section>
    </>
  );
}

function TermsContent() {
  return (
    <>
      <p className="mb-6 text-xs text-slate-400">
        본 약관은 일반적인 템플릿이며 법률 자문이 아닙니다. 【운영자명】, 【시행일】을 실제 정보로 교체해주세요.
      </p>
      <Section title="제1조 (목적)">
        <p>이 약관은 【운영자명】(이하 "운영자")가 제공하는 골프 스코어카드 서비스(이하 "서비스")의 이용과 관련하여 운영자와 이용자의 권리·의무 및 책임사항을 규정합니다.</p>
      </Section>
      <Section title="제2조 (서비스의 제공)">
        <p>서비스는 골프·파크골프 라운드 기록, 통계 제공 등의 기능을 무료로 제공합니다.</p>
      </Section>
      <Section title="제3조 (회원가입 및 계정 관리)">
        <p>이용자는 이메일과 비밀번호로 가입하며, 계정 정보를 본인이 직접 관리할 책임이 있습니다.</p>
      </Section>
      <Section title="제4조 (이용자의 의무)">
        <p>이용자는 타인의 정보를 도용하거나 서비스를 부정한 목적으로 사용해서는 안 됩니다.</p>
      </Section>
      <Section title="제5조 (서비스의 변경 및 중단)">
        <p>운영자는 서비스의 안정적 제공을 위해 노력하나, 불가피한 사정으로 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</p>
      </Section>
      <Section title="제6조 (면책조항)">
        <p>운영자는 이용자가 입력한 기록의 정확성에 대해 보증하지 않으며, 천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</p>
      </Section>
      <Section title="제7조 (시행일)">
        <p>이 약관은 【시행일】부터 적용됩니다.</p>
      </Section>
    </>
  );
}
