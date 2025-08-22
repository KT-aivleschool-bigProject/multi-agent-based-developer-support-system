package multiagentbaseddevelopersupportsystem.util;

public class MaskingUtil {

    /**
     * 이름 마스킹
     *
     * @param name {String} 원본 이름
     * @return {String} 마스킹 처리된 이름
     */
    public static String maskName(String name) {
        if (name == null || name.length() < 2) {
            return name; // 기본 형식 미충족 시 그대로 반환
        }

        int length = name.length();
        StringBuilder maskedName = new StringBuilder(name);

        // [CASE1] 2자리: 첫 글자 마스킹
        if (length == 2) {
            maskedName.setCharAt(0, '*');
        }
        // [CASE2] 3자리: 두 번째 글자 마스킹
        else if (length == 3) {
            maskedName.setCharAt(1, '*');
        }
        // [CASE3] 4자리: 가운데 2글자 마스킹
        else if (length == 4) {
            maskedName.setCharAt(1, '*');
            maskedName.setCharAt(2, '*');
        }
        // [CASE4] 5자리: 2~4번째 글자 마스킹
        else if (length == 5) {
            maskedName.setCharAt(1, '*');
            maskedName.setCharAt(2, '*');
            maskedName.setCharAt(3, '*');
        }
        // [CASE5] 6자리 이상: 첫/마지막 제외 모두 마스킹
        else {
            for (int i = 1; i < length - 1; i++) {
                maskedName.setCharAt(i, '*');
            }
        }

        return maskedName.toString();
    }

    /**
     * 이메일 마스킹
     *
     * @param email {String} 원본 이메일
     * @return {String} 마스킹 처리된 이메일
     */
    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return email; // 기본 형식 미충족 시 그대로 반환
        }

        String[] parts = email.split("@");
        if (parts.length != 2) {
            return email; // 잘못된 이메일 형식은 그대로 반환
        }

        String idPart = parts[0];
        String domainPart = parts[1];

        // 아이디 부분이 3자리 이하인 경우 마스킹하지 않음
        if (idPart.length() <= 3) {
            return email;
        }

        StringBuilder maskedEmail = new StringBuilder();
        maskedEmail.append(idPart.substring(0, 3));
        for (int i = 3; i < idPart.length(); i++) {
            maskedEmail.append('*');
        }
        maskedEmail.append('@').append(domainPart);

        return maskedEmail.toString();
    }
}

