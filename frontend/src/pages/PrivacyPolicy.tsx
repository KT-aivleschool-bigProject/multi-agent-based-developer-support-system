import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

// 개인정보 처리방침 페이지 (개인정보 수집/이용 동의 페이지와 별도)
// - 한국어 기준 일반적인 항목을 포함했습니다.
// - 실제 서비스에 맞게 항목/보유기간/수탁사/국외이전 여부 등을 반드시 수정하세요.

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const updatedAt = '2025-08-11'; // 마지막 업데이트 날짜 (Asia/Seoul)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <div className="flex items-center">
            <FileText className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">개인정보 처리방침</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DevCollab 개인정보 처리방침</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 prose prose-sm max-w-none">
            {/* 소개 */}
            <section>
              <p className="text-muted-foreground">
                DevCollab(이하 "회사")은 개인정보 보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 안전하게 보호하기 위해 다음과 같이 개인정보 처리방침을 수립·공개합니다.
              </p>
            </section>

            {/* 수집 항목 및 수집 방법 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">1. 수집하는 개인정보 항목 및 방법</h3>
              <p className="text-muted-foreground">① 수집 항목</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>필수: 이메일, 사용자명, 비밀번호</li>
                <li>선택: 직무</li>
                <li>자동 수집: IP 주소, 쿠키, 접속 일시, 서비스 이용 기록, 기기/브라우저 정보</li>
              </ul>
              <p className="text-muted-foreground mt-3">② 수집 방법</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원가입 및 서비스 이용 과정에서 이용자가 직접 입력</li>
                <li>로그 분석 도구 등 자동 수집 모듈을 통한 수집</li>
              </ul>
            </section>

            {/* 이용 목적 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">2. 개인정보의 이용 목적</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원 식별 및 관리, 본인확인, 부정이용 방지</li>
                <li>서비스 제공, 기능 개선, 맞춤형 기능/콘텐츠 제공</li>
                <li>공지/알림 전달, 고객문의 처리, 분쟁 대응</li>
                <li>서비스 품질 향상 및 통계/분석</li>
              </ul>
            </section>

            {/* 보유 및 이용 기간 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">3. 보유 및 이용 기간</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원정보: 회원 탈퇴 시까지 보유 후 지체 없이 파기</li>
                <li>계약 및 대금결제 기록: 관련 법령에 따른 기간(전자상거래법 등, 통상 5년)</li>
                <li>접속 로그/IP: 통신비밀보호법에 따라 3개월</li>
                <li>그 외 법령에 별도 보존 규정이 있는 경우 해당 기간</li>
              </ul>
            </section>

            {/* 제3자 제공 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h3>
              <p className="text-muted-foreground">
                회사는 법령에 근거가 있거나 이용자의 사전 동의가 있는 경우에 한하여 개인정보를 제3자에게 제공합니다. 현재 정기적인 제3자 제공은 없습니다. (변경 시 사전 고지 및 동의)
              </p>
            </section>

            {/* 처리위탁 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">5. 개인정보 처리의 위탁</h3>
              <p className="text-muted-foreground">
                원활한 서비스 제공을 위해 일부 업무를 외부 전문업체에 위탁할 수 있습니다. 위탁 시 계약을 통해 개인정보 보호 관련 법령을 준수하도록 관리·감독합니다.
              </p>
              <div className="bg-muted p-4 rounded-lg text-muted-foreground">
                <p className="mb-1">현재 위탁 현황:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>클라우드 인프라 운영: Google Cloud / Azure</li>
                  <li>알림/메일 발송: (예) SendGrid, Firebase Cloud Messaging</li>
                  <li>로그/분석: (예) Sentry, Google Analytics</li>
                </ul>
              </div>
            </section>

            {/* 국외 이전 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">6. 개인정보의 국외 이전</h3>
              <p className="text-muted-foreground">
                해외 클라우드/서비스를 이용하는 경우 개인정보가 국외로 이전될 수 있습니다. 국외 이전이 발생하는 경우 이전 국가·이전 일시·이전방법·보유/이용 기간 등을 서비스 내 공지로 고지하고 필요한 동의를 받겠습니다.
              </p>
            </section>

            {/* 이용자 및 법정대리인의 권리 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">7. 이용자의 권리와 행사 방법</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>개인정보 열람, 정정, 삭제, 처리정지 요구 권리</li>
                <li>동의 철회 및 회원 탈퇴</li>
                <li>권리 행사는 고객센터(privacy@devcollab.com)로 문의</li>
              </ul>
            </section>

            {/* 쿠키 정책 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">8. 쿠키(Cookie)의 이용</h3>
              <p className="text-muted-foreground">
                회사는 맞춤형 서비스 제공을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부하거나 삭제할 수 있으며, 이 경우 일부 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>

            {/* 안전성 확보 조치 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">9. 개인정보의 안전성 확보 조치</h3>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기 교육</li>
                <li>기술적 조치: 접근권한 관리, 암호화, 보안 프로그램 설치, 로그/접속기록 보관</li>
                <li>물리적 조치: 전산실/자료보관실 접근통제</li>
              </ul>
            </section>

            {/* 아동의 개인정보 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">10. 아동의 개인정보 보호</h3>
              <p className="text-muted-foreground">
                회사는 만 14세 미만 아동의 개인정보를 법정대리인의 동의 없이 수집하지 않습니다. 아동 관련 문의는 고객센터로 연락해 주십시오.
              </p>
            </section>

            {/* 변경에 대한 고지 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">11. 처리방침의 변경</h3>
              <p className="text-muted-foreground">
                본 처리방침은 법령·정책 또는 서비스의 변경에 따라 수정될 수 있으며, 변경사항은 시행 7일 전에 공지합니다.
              </p>
            </section>

            {/* 문의처 */}
            <section>
              <h3 className="text-lg font-semibold mb-3">12. 개인정보 보호책임자 및 연락처</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>개인정보 보호책임자</strong><br />
                  이메일: gorani@devcollab.com<br />
                  전화번호: 02-1234-5678
                </p>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                시행일: 2024-01-01 · 마지막 업데이트: {updatedAt}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
