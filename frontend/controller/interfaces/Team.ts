/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Team {
  id: number
  type: string
  url: string
  related: {
    created_by: string
    modified_by: string
    projects: string
    users: string
    credentials: string
    roles: string
    object_roles: string
    activity_stream: string
    access_list: string
    organization: string
  }
  summary_fields: {
    organization: {
      id: number
      name: string
      description: string
    }
    created_by: {
      id: number
      username: string
      first_name: string
      last_name: string
    }
    modified_by: {
      id: number
      username: string
      first_name: string
      last_name: string
    }
    object_roles: {
      admin_role: {
        description: string
        name: string
        id: number
      }
      member_role: {
        description: string
        name: string
        id: number
      }
      read_role: {
        description: string
        name: string
        id: number
      }
    }
    user_capabilities: {
      edit: boolean
      delete: boolean
    }
  }
  created: string
  modified: string
  name: string
  description: string
  organization: number
}
