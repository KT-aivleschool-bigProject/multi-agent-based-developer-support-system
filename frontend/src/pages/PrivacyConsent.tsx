import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

const PrivacyConsent = () => {
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
            <h1 className="text-3xl font-bold">개인정보 수집 동의</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DevCollab 개인정보 수집 및 이용 동의</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm max-w-none">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. 개인정보 수집 목적</h3>
              <p className="text-muted-foreground">
                DevCollab은 다음의 목적을 위하여 개인정보를 수집하고 이용합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원 가입 및 관리</li>
                <li>서비스 제공 및 계약의 이행</li>
                <li>개인 맞춤 서비스 제공</li>
                <li>고지사항 전달, 서비스 이용 안내</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. 수집하는 개인정보 항목</h3>
              <p className="text-muted-foreground">
                DevCollab은 다음의 개인정보를 수집합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>필수항목: 이메일, 사용자명, 비밀번호</li>
                <li>선택항목: 직무</li>
                <li>자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. 개인정보의 보유 및 이용 기간</h3>
              <p className="text-muted-foreground">
                수집된 개인정보는 다음과 같이 보유 및 이용됩니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원 정보: 회원 탈퇴 시까지</li>
                <li>서비스 이용 기록: 3년</li>
                <li>접속 로그 기록: 3개월</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. 동의 거부 권리 및 불이익</h3>
              <p className="text-muted-foreground">
                개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수항목에 대한 동의를 거부할 경우 서비스 이용이 제한될 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. 동의서 변경</h3>
              <p className="text-muted-foreground">
                이 개인정보 수집 및 이용 동의서는 2024년 1월 1일부터 적용됩니다. 동의서의 내용이 변경될 경우 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. 개인정보 보호책임자</h3>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-muted-foreground">
                  <strong>개인정보 보호책임자</strong><br />
                  연락처: gorani@devcollab.com<br />
                  전화번호: 02-1234-5678
                </p>
              </div>
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

export default PrivacyConsent;