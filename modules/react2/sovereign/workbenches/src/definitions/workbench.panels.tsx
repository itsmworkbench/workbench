import SqlWorkbench2 from './sql.workbench';
//import LdapWorkbench from './ldap.workbench';
import EmailWorkbench2 from './email.workbench';
//import ReceiveEmailWorkbench from './receiveEmail.workbench';
//import ReviewTicketWorkbench from './reviewTicket.workbench';
//import SelectKaWorkbench from './selectKa.workbench';

export const workbenchPanels: Record<string, React.FC> = {
    SQL: SqlWorkbench2,
  //  LDAP: LdapWorkbench,
    Email: EmailWorkbench2,
  //  ReceiveEmail: ReceiveEmailWorkbench,
  //  ReviewTicket: ReviewTicketWorkbench,
  //  SelectKnowledgeArticle: SelectKaWorkbench,
};