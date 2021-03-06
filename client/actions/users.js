'use strict'

import Request from 'superagent/lib/client'
import { pushPath } from 'redux-simple-router'

import * as usersActions from '../constants/users'
import {logout} from './auth'

export function getUsers () {
  return (dispatch) => {
    dispatch({type: usersActions.GET_USERS_REQUEST})

    Request
      .get('/api/user')
      .end((err, resp) => {
        if (resp.unauthorized) {
          return dispatch(logout())
        }

        if (err || !resp.body) {
          return dispatch({
            type: usersActions.GET_USERS_RESPONSE,
            niceError: 'Can\'t fetch users',
            hasError: true,
            result: null
          })
        }

        dispatch({
          type: usersActions.GET_USERS_RESPONSE,
          niceError: null,
          hasError: false,
          result: resp.body.data
        })
      })
  }
}

export function deleteUser (userId) {
  return (dispatch) => {
    dispatch({type: usersActions.DELETE_USER_REQUEST})

    Request
      .delete('/api/user/' + userId)
      .end((err, resp) => {
        if (resp.unauthorized) {
          return dispatch(logout())
        }

        if (err || !resp.body) {
          return dispatch({
            type: usersActions.DELETE_USER_RESPONSE,
            niceError: 'Can\'t delete user',
            hasError: true
          })
        }

        dispatch({
          type: usersActions.DELETE_USER_RESPONSE,
          niceError: null,
          hasError: false
        })

        dispatch(getUsers())
      })
  }
}

export function closeSession (userId) {
  return (dispatch) => {
    dispatch({type: usersActions.CLOSE_SESSION_REQUEST})

    Request
      .post('/api/user/' + userId + '/session/close')
      .end((err, resp) => {
        if (resp.unauthorized) {
          return dispatch(logout())
        }

        if (err || !resp.body) {
          return dispatch({
            type: usersActions.CLOSE_SESSION_RESPONSE,
            niceError: 'Can\'t close user session',
            hasError: true
          })
        }

        dispatch({
          type: usersActions.CLOSE_SESSION_RESPONSE,
          niceError: null,
          hasError: false
        })
      })
  }
}

export function getUser (userId, redirectTo) {
  return (dispatch) => {

    dispatch({type: usersActions.LOAD_USER_REQUEST})

    Request
      .get('/api/user/' + userId)
      .end((err, resp) => {
        if (err || !resp.body) {
          dispatch({
            type: usersActions.LOAD_USER_RESPONSE,
            niceError: 'Can\'t load user',
            hasError: true,
            editUser: null
          })
        }
        else {
          dispatch({
            type: usersActions.LOAD_USER_RESPONSE,
            niceError: null,
            hasError: false,
            editUser: resp.body.data
          })

          if (redirectTo) {
            return dispatch(pushPath(redirectTo))
          }
        }
      })
  }
}

export function upsertUser (userId, data) {
  return (dispatch, getState) => {
    let state = getState()
    dispatch({type: usersActions.UPSERT_USER_REQUEST})

    if (userId) {
      data.orig_email = state.users.editUser.email
      Request
        .put('/api/user')
        .type('form')
        .send(data)
        .end((err, resp) => {
          if (err || !resp.body) {
            dispatch({
              type: usersActions.UPDATE_USER_RESPONSE,
              niceError: 'Can\'t update user',
              hasError: true,
              result: null
            })
          }
          else {
            dispatch({
              type: usersActions.UPDATE_USER_RESPONSE,
              niceError: null,
              hasError: false,
              result: resp.body.data
            })

            dispatch(pushPath('/users'))
          }
        })
    }
    else {
      Request
        .post('/api/user')
        .type('form')
        .send(data)
        .end((err, resp) => {
          if (err || !resp.body) {
            dispatch({
              type: usersActions.CREATE_USER_RESPONSE,
              niceError: 'Can\'t create user',
              hasError: true,
              result: null
            })
          }
          else {
            dispatch({
              type: usersActions.CREATE_USER_RESPONSE,
              niceError: null,
              hasError: false,
              result: resp.body.data
            })
            dispatch(pushPath('/users'))
          }
        })
    }
  }
}
