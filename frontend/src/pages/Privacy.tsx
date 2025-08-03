import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const Privacy = () => {
  const navigate = useNavigate();

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
            <Shield className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">개인정보처리방침</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DevCollab 개인정보처리방침</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm max-w-none">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. 개인정보의 처리 목적</h3>
              <p className="text-muted-foreground">
                DevCollab은 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원 가입 및 관리</li>
                <li>서비스 제공 및 계약의 이행</li>
                <li>개인 맞춤 서비스 제공</li>
                <li>고지사항 전달, 서비스 이용 안내</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. 개인정보의 처리 및 보유 기간</h3>
              <p className="text-muted-foreground">
                개인정보는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 처리·보유합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원 정보: 회원 탈퇴 시까지</li>
                <li>서비스 이용 기록: 3년</li>
                <li>접속 로그 기록: 3개월</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. 처리하는 개인정보의 항목</h3>
              <p className="text-muted-foreground">
                DevCollab은 다음의 개인정보 항목을 처리하고 있습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>필수항목: 이메일, 사용자명, 비밀번호</li>
                <li>선택항목: 직무, 프로필 사진</li>
                <li>자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. 개인정보의 제3자 제공</h3>
              <p className="text-muted-foreground">
                DevCollab은 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. 개인정보의 파기</h3>
              <p className="text-muted-foreground">
                DevCollab은 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. 정보주체의 권리·의무 및 그 행사방법</h3>
              <p className="text-muted-foreground">
                정보주체는 DevCollab에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>개인정보 처리정지 요구</li>
                <li>개인정보 열람요구</li>
                <li>개인정보 정정·삭제 요구</li>
                <li>개인정보 처리정지 요구</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. 개인정보 보호책임자</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>개인정보 보호책임자</strong><br />
                  연락처: privacy@devcollab.com<br />
                  전화번호: 02-1234-5678
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. 개인정보 처리방침 변경</h3>
              <p className="text-muted-foreground">
                이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다. 개인정보처리방침의 내용 추가, 삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                본 방침은 2024년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;