import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Terms = () => {
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
            <FileText className="h-6 w-6 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">서비스 이용약관</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>DevCollab 서비스 이용약관</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 prose prose-sm max-w-none">
            <section>
              <h3 className="text-lg font-semibold mb-3">제1조 (목적)</h3>
              <p className="text-muted-foreground">
                이 약관은 DevCollab(이하 "회사")이 제공하는 서비스의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제2조 (정의)</h3>
              <p className="text-muted-foreground">
                이 약관에서 사용하는 용어의 정의는 다음과 같습니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>"서비스"란 회사가 제공하는 개발자 협업 플랫폼을 의미합니다.</li>
                <li>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제3조 (약관의 효력 및 변경)</h3>
              <p className="text-muted-foreground">
                이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다. 회사는 합리적인 사유가 발생할 경우 이 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경된 약관의 내용과 시행일을 명시하여 현행약관과 함께 서비스의 초기화면에 그 시행일 7일 이전부터 시행일 후 상당한 기간 동안 공지합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제4조 (회원가입)</h3>
              <p className="text-muted-foreground">
                서비스를 이용하고자 하는 자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>회원가입은 신청자가 온라인으로 약관에 동의하고 가입신청을 하면 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제5조 (서비스의 제공 및 변경)</h3>
              <p className="text-muted-foreground">
                회사는 다음과 같은 업무를 수행합니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>개발자 협업 도구 제공</li>
                <li>프로젝트 관리 서비스</li>
                <li>코드 관리 및 공유 서비스</li>
                <li>기타 회사가 정하는 업무</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제6조 (서비스의 중단)</h3>
              <p className="text-muted-foreground">
                회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제7조 (회원의 의무)</h3>
              <p className="text-muted-foreground">
                회원은 다음 행위를 하여서는 안 됩니다.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                <li>신청 또는 변경시 허위내용의 등록</li>
                <li>타인의 정보도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 회사에 공개 또는 게시하는 행위</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제8조 (저작권의 귀속 및 이용제한)</h3>
              <p className="text-muted-foreground">
                회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다. 이용자는 회사를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제9조 (계약해지 및 이용제한)</h3>
              <p className="text-muted-foreground">
                회원이 이용계약을 해지하고자 하는 때에는 회원 본인이 온라인을 통해 회사에 해지신청을 하여야 합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제10조 (손해배상)</h3>
              <p className="text-muted-foreground">
                회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중과실에 의한 경우를 제외하고는 이에 대하여 책임을 부담하지 아니합니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제11조 (면책조항)</h3>
              <p className="text-muted-foreground">
                회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">제12조 (준거법 및 재판관할)</h3>
              <p className="text-muted-foreground">
                서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 대한민국 법을 적용하며, 본 분쟁으로 인한 소는 회사의 본사 소재지를 관할하는 법원에 제기합니다.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                본 약관은 2024년 1월 1일부터 시행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;